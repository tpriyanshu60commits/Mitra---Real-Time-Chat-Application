import mongoose from "mongoose";
import https from "https";
import http from "http";
import Message from "../models/messageModel.js";
import cloudinary, { uploadBufferToCloudinary } from "../config/cloudinary.js";

function parseCloudinaryUrl(url) {
  if (!url) return null;
  const match = url.match(
    /\/([^\/]+)\/upload\/(?:v\d+\/)?(.+?)(?:\.([a-zA-Z0-9]+))?$/,
  );
  if (match) {
    const resource_type = match[1];
    let public_id = match[2];
    let format = match[3] || "";
    if (resource_type === "raw" && format) {
      public_id = `${public_id}.${format}`;
      format = "";
    }
    return { resource_type, public_id, format };
  }
  return null;
}

export const SendMessage = async (req, res, next) => {
  try {
    const receiverId = req.body.receiverId || req.body.receiverID;
    const messageText = (req.body.message || "").trim();
    const currentUser = req.user;

    if (!receiverId) {
      const error = new Error("Receiver ID is required");
      error.statusCode = 400;
      return next(error);
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      const error = new Error("Invalid receiver ID");
      error.statusCode = 400;
      return next(error);
    }

    let fileUrl = req.body.fileUrl || null;
    let fileName = req.body.fileName || null;
    let fileSize = req.body.fileSize ? Number(req.body.fileSize) : null;
    let fileType = req.body.fileType || null;
    let messageType = req.body.messageType || "text";

    if (req.file) {
      const isImage = req.file.mimetype.startsWith("image/");
      const isPdf =
        req.file.mimetype === "application/pdf" ||
        req.file.originalname.toLowerCase().endsWith(".pdf");

      messageType = isImage ? "image" : isPdf ? "pdf" : "file";
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;

      // Clean filename for Cloudinary public_id
      const rawName = req.file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const ext = isPdf ? ".pdf" : isImage ? "" : `_${req.file.originalname}`;

      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        resource_type: isImage ? "image" : "raw",
        public_id: `${Date.now()}_${rawName}${ext}`,
        folder: "mingo_chat_media",
      });

      fileUrl = uploadResult.secure_url;
    }

    if (!messageText && !fileUrl) {
      const error = new Error("Message text or file attachment is required");
      error.statusCode = 400;
      return next(error);
    }
    const newMessage = await Message.create({
      senderId: currentUser._id,
      receiverId,
      message: messageText,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    });
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("SendMessage Error:", error);
    next(error);
  }
};

export const GetMessages = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const currentUser = req.user;

    if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
      const error = new Error("Invalid friend ID");
      error.statusCode = 400;
      return next(error);
    }

    const friendIdStr = friendId.toString();
    const userIdStr = currentUser._id.toString();

    // Fetch message history matching both ObjectId and String BSON formats
    const messages = await Message.find({
      $expr: {
        $or: [
          {
            $and: [
              { $eq: [{ $toString: "$senderId" }, userIdStr] },
              { $eq: [{ $toString: "$receiverId" }, friendIdStr] },
            ],
          },
          {
            $and: [
              { $eq: [{ $toString: "$senderId" }, friendIdStr] },
              { $eq: [{ $toString: "$receiverId" }, userIdStr] },
            ],
          },
          {
            $and: [
              { $eq: [{ $toString: "$senderID" }, userIdStr] },
              { $eq: [{ $toString: "$receiverID" }, friendIdStr] },
            ],
          },
          {
            $and: [
              { $eq: [{ $toString: "$senderID" }, friendIdStr] },
              { $eq: [{ $toString: "$receiverID" }, userIdStr] },
            ],
          },
        ],
      },
    })
      .sort({ createdAt: 1 })
      .select("-__v");

    // Mark unread messages sent to the current user as read
    await Message.updateMany(
      {
        $expr: {
          $or: [
            {
              $and: [
                { $eq: [{ $toString: "$senderId" }, friendIdStr] },
                { $eq: [{ $toString: "$receiverId" }, userIdStr] },
              ],
            },
            {
              $and: [
                { $eq: [{ $toString: "$senderID" }, friendIdStr] },
                { $eq: [{ $toString: "$receiverID" }, userIdStr] },
              ],
            },
          ],
        },
        isRead: false,
      },
      { $set: { isRead: true } },
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("GetMessages Error:", error);
    next(error);
  }
};

export const GetConversations = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const userIdStr = currentUser._id.toString();

    // Fetch latest message for each distinct friend
    const conversations = await Message.aggregate([
      {
        $addFields: {
          sId: {
            $ifNull: [{ $toString: "$senderId" }, { $toString: "$senderID" }],
          },
          rId: {
            $ifNull: [
              { $toString: "$receiverId" },
              { $toString: "$receiverID" },
            ],
          },
        },
      },
      {
        $match: {
          $or: [{ sId: userIdStr }, { rId: userIdStr }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sId", userIdStr] }, "$rId", "$sId"],
          },
          lastMessage: {
            $first: {
              $cond: [
                { $gt: [{ $strLenCP: { $ifNull: ["$message", ""] } }, 0] },
                "$message",
                {
                  $cond: [
                    { $eq: ["$messageType", "image"] },
                    "📷 Photo",
                    {
                      $cond: [
                        { $eq: ["$messageType", "pdf"] },
                        "📄 PDF Document",
                        {
                          $cond: [
                            { $eq: ["$messageType", "file"] },
                            "📎 Attachment",
                            "Message",
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          lastMessageAt: { $first: "$createdAt" },
          lastMessageType: { $first: "$messageType" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$rId", userIdStr] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("GetConversations Error:", error);
    next(error);
  }
};

export const StreamMessageFile = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      const error = new Error("Invalid message ID");
      error.statusCode = 400;
      return next(error);
    }

    const message = await Message.findById(messageId);
    if (!message || !message.fileUrl) {
      const error = new Error("File attachment not found");
      error.statusCode = 404;
      return next(error);
    }

    const fileName = message.fileName || "document.pdf";
    const isPdf =
      message.messageType === "pdf" ||
      message.fileType === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf") ||
      message.fileUrl.toLowerCase().includes(".pdf");

    const contentType = isPdf
      ? "application/pdf"
      : message.fileType || "application/octet-stream";

    const isDownload = req.query.download === "true";
    const disposition = isDownload ? "attachment" : "inline";

    const pageNum = req.query.page ? Number(req.query.page) : null;

    let fetchUrl = message.fileUrl;
    const parsed = parseCloudinaryUrl(message.fileUrl);

    if (parsed) {
      try {
        if (pageNum && isPdf) {
          fetchUrl = cloudinary.url(parsed.public_id, {
            format: "jpg",
            page: pageNum,
            quality: "auto",
            width: 1400,
            crop: "limit",
            secure: true,
          });
        } else {
          fetchUrl = cloudinary.utils.private_download_url(
            parsed.public_id,
            parsed.format || "",
            {
              resource_type: parsed.resource_type || "image",
              type: "upload",
              expires_at: Math.floor(Date.now() / 1000) + 7200,
            },
          );
        }
      } catch (signErr) {
        console.warn(
          "Could not generate signed download url:",
          signErr.message,
        );
      }
    }

    try {
      const upstreamRes = await fetch(fetchUrl);
      if (!upstreamRes.ok) {
        const fallbackRes = await fetch(message.fileUrl);
        if (!fallbackRes.ok) {
          return res.redirect(message.fileUrl);
        }
        res.setHeader("Content-Type", contentType);
        res.setHeader(
          "Content-Disposition",
          `${disposition}; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        );
        const { Readable } = await import("stream");
        return Readable.fromWeb(fallbackRes.body).pipe(res);
      }

      const resContentType = pageNum ? "image/jpeg" : contentType;
      res.setHeader("Content-Type", resContentType);
      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      );

      const contentLength = upstreamRes.headers.get("content-length");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      // Stream the response directly to client
      const { Readable } = await import("stream");
      Readable.fromWeb(upstreamRes.body).pipe(res);
    } catch (fetchErr) {
      console.error("Upstream fetch error, redirecting:", fetchErr);
      return res.redirect(message.fileUrl);
    }
  } catch (error) {
    console.error("StreamMessageFile Error:", error);
    next(error);
  }
};
