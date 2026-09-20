import mongoose from "mongoose";
import Message from "../models/messageModel.js";

const userSockets = new Map();

const getOnlineUsersMap = () => {
  const onlineMap = {};
  for (const [userId, socketSet] of userSockets.entries()) {
    if (socketSet.size > 0) {
      // Pick first socket ID for backward compatibility
      onlineMap[userId] = [...socketSet][0];
    }
  }
  return onlineMap;
};

const WebSocket = (io) => {
  console.log("🔌 WebSocket server initialized");

  io.on("connection", (socket) => {
    console.log("⚡ New socket connection:", socket.id);

    // ================= REGISTER USER =================
    const registerUser = (userId) => {
      if (!userId) return;
      const strUserId = userId.toString();
      socket.userId = strUserId;

      if (!userSockets.has(strUserId)) {
        userSockets.set(strUserId, new Set());
      }
      userSockets.get(strUserId).add(socket.id);

      console.log(`👤 User registered: ${strUserId} (Socket: ${socket.id})`);
      const onlineMap = getOnlineUsersMap();
      io.emit("onlineUsers", onlineMap);
    };

    // Support both standard and legacy registration events
    socket.on("register", registerUser);
    socket.on("OmBhramyaNamah", registerUser);

    // ================= UNREGISTER / LOGOUT =================
    const unregisterUser = (userId) => {
      const strUserId = (userId || socket.userId)?.toString();
      if (!strUserId) return;

      if (userSockets.has(strUserId)) {
        const socketSet = userSockets.get(strUserId);
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          userSockets.delete(strUserId);
        }
      }

      console.log(`👋 User unregistered: ${strUserId}`);
      const onlineMap = getOnlineUsersMap();
      io.emit("onlineUsers", onlineMap);
    };

    socket.on("unregister", unregisterUser);
    socket.on("OmNamahShivay", unregisterUser);

    // ================= SEND MESSAGE =================
    socket.on("send", async (payload, callback) => {
      try {
        console.log("📩 Incoming message payload:", payload);

        const senderId = payload.senderID || payload.senderId || socket.userId;
        const receiverId = payload.receiverID || payload.receiverId;
        const messageText = (payload.message || "").trim();
        const fileUrl = payload.fileUrl || null;
        const fileName = payload.fileName || null;
        const fileSize = payload.fileSize ? Number(payload.fileSize) : null;
        const fileType = payload.fileType || null;
        const messageType =
          payload.messageType ||
          (fileUrl
            ? fileType?.startsWith("image/")
              ? "image"
              : fileType === "application/pdf"
                ? "pdf"
                : "file"
            : "text");

        if (!senderId || !receiverId || (!messageText && !fileUrl)) {
          const errResponse = {
            success: false,
            message: "Missing required fields",
          };
          if (typeof callback === "function") callback(errResponse);
          socket.emit("send_error", errResponse);
          return;
        }

        let messageData;

        // If the message was ALREADY saved to MongoDB (e.g. via REST multipart upload), do NOT create a duplicate!
        if (
          payload._id &&
          !payload._id.toString().startsWith("temp-") &&
          mongoose.Types.ObjectId.isValid(payload._id)
        ) {
          messageData = {
            _id: payload._id,
            senderId: (
              payload.senderId ||
              payload.senderID ||
              senderId
            ).toString(),
            receiverId: (
              payload.receiverId ||
              payload.receiverID ||
              receiverId
            ).toString(),
            message: messageText,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            fileType,
            isRead: payload.isRead || false,
            createdAt: payload.createdAt || new Date().toISOString(),
            updatedAt: payload.updatedAt || new Date().toISOString(),
          };
          console.log(
            "⚡ Broadcasting pre-persisted message without duplicating in DB:",
            messageData._id,
          );
        } else {
          // Persist fresh message to MongoDB
          const newMessage = await Message.create({
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiverId),
            message: messageText,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            fileType,
          });

          messageData = {
            _id: newMessage._id,
            senderId: newMessage.senderId.toString(),
            receiverId: newMessage.receiverId.toString(),
            message: newMessage.message,
            messageType: newMessage.messageType,
            fileUrl: newMessage.fileUrl,
            fileName: newMessage.fileName,
            fileSize: newMessage.fileSize,
            fileType: newMessage.fileType,
            isRead: newMessage.isRead,
            createdAt: newMessage.createdAt,
            updatedAt: newMessage.updatedAt,
          };

          console.log("💾 Message saved & formatted:", messageData);
        }

        // Deliver to all active sockets of the recipient
        const receiverSockets = userSockets.get(receiverId.toString());
        if (receiverSockets && receiverSockets.size > 0) {
          receiverSockets.forEach((sockId) => {
            io.to(sockId).emit("receive", messageData);
          });
          console.log(
            `📤 Delivered to recipient ${receiverId} (${receiverSockets.size} sockets)`,
          );
        }

        // Deliver to sender's other sockets (multi-tab sync)
        const senderSockets = userSockets.get(senderId.toString());
        if (senderSockets && senderSockets.size > 0) {
          senderSockets.forEach((sockId) => {
            if (sockId !== socket.id) {
              io.to(sockId).emit("receive", messageData);
            }
          });
        }

        // Acknowledge back to sender
        if (typeof callback === "function") {
          callback({ success: true, data: messageData });
        }
        socket.emit("message_sent", messageData);
      } catch (error) {
        console.error("❌ Error sending message via socket:", error);
        const errResponse = {
          success: false,
          message: error.message || "Failed to send message",
        };
        if (typeof callback === "function") callback(errResponse);
        socket.emit("send_error", errResponse);
      }
    });

    // ================= TYPING INDICATORS =================
    socket.on("typing", ({ senderId, receiverId }) => {
      const recId = (receiverId || "").toString();
      const sendId = (senderId || socket.userId || "").toString();
      if (!recId || !sendId) return;

      const receiverSockets = userSockets.get(recId);
      if (receiverSockets) {
        receiverSockets.forEach((sockId) => {
          io.to(sockId).emit("user_typing", {
            senderId: sendId,
            receiverId: recId,
          });
        });
      }
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      const recId = (receiverId || "").toString();
      const sendId = (senderId || socket.userId || "").toString();
      if (!recId || !sendId) return;

      const receiverSockets = userSockets.get(recId);
      if (receiverSockets) {
        receiverSockets.forEach((sockId) => {
          io.to(sockId).emit("user_stop_typing", {
            senderId: sendId,
            receiverId: recId,
          });
        });
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId && userSockets.has(userId)) {
        const socketSet = userSockets.get(userId);
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          userSockets.delete(userId);
          console.log(`🔌 User disconnected completely: ${userId}`);
        } else {
          console.log(
            `🔌 User closed a socket: ${userId} (${socketSet.size} remaining)`,
          );
        }
        io.emit("onlineUsers", getOnlineUsersMap());
      } else {
        // Fallback cleanup check
        for (const [uid, sockets] of userSockets.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              userSockets.delete(uid);
            }
            io.emit("onlineUsers", getOnlineUsersMap());
            break;
          }
        }
      }
    });
  });
};

export default WebSocket;
