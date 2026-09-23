import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import socketAPI from "../../config/webSocket";
import toast from "react-hot-toast";
import {
  HiPaperClip,
  HiEmojiHappy,
  HiPaperAirplane,
  HiArrowLeft,
  HiRefresh,
  HiDocumentText,
  HiX,
  HiEye,
} from "react-icons/hi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4500";

const COMMON_EMOJIS = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "🔥",
  "🎉",
  "🙌",
  "😍",
  "😎",
  "🚀",
  "✨",
  "💯",
  "👏",
  "🤔",
  "🥺",
  "🥳",
  "🙏",
  "💪",
  "💡",
  "👋",
  "👀",
  "⭐",
  "🤝",
  "☕",
];

// Format message timestamp (e.g., 04:30 PM)
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// Format date header (e.g., Today, Yesterday, Mar 15, 2026)
const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  try {
    const msgDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return msgDate.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        msgDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
};

// Format bytes into human readable string
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const Chatting = ({
  selectedFriend,
  currentUser,
  isOnline = false,
  onBack,
  onNewMessageSent,
}) => {
  const { user } = useAuth();
  const currentUserId = (user?._id || currentUser?._id)?.toString();
  const friendId = selectedFriend?._id?.toString();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activePdfModal, setActivePdfModal] = useState(null);

  // Helper to generate reliable streaming URL via backend proxy
  const getFileStreamUrl = (chat) => {
    if (chat?._id && !chat._id.toString().startsWith("temp-")) {
      return `${BACKEND_URL}/api/messages/file/${chat._id}`;
    }
    return chat?.fileUrl;
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
        setActivePdfModal(null);
        setShowEmojiPicker(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!friendId) return;
    try {
      setLoadingHistory(true);
      let res;
      try {
        res = await api.get(`/messages/${friendId}`);
      } catch {
        res = await api.get(`/user/get-messages/${friendId}`);
      }
      setChatMessages(res.data.data || []);
      setTimeout(() => scrollToBottom("auto"), 50);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setLoadingHistory(false);
    }
  }, [friendId, scrollToBottom]);

  // Load history on selectedFriend change
  useEffect(() => {
    fetchChatHistory();
    setIsTyping(false);
    setShowEmojiPicker(false);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setActivePdfModal(null);
  }, [fetchChatHistory]);

  // Scroll whenever messages change
  useEffect(() => {
    if (!loadingHistory) {
      scrollToBottom();
    }
  }, [chatMessages, loadingHistory, scrollToBottom]);

  // Socket listener for incoming messages & typing indicators for active chat
  useEffect(() => {
    if (!friendId || !currentUserId) return;

    const handleReceive = (incomingMsg) => {
      const incomingSenderId = (
        incomingMsg?.senderId || incomingMsg?.senderID
      )?.toString();
      const activeFriendId = friendId.toString();

      if (incomingSenderId === activeFriendId) {
        setIsTyping(false);
        setChatMessages((prev) => {
          if (incomingMsg._id && prev.some((m) => m._id === incomingMsg._id)) {
            return prev;
          }
          return [...prev, incomingMsg];
        });
      }
    };

    const handleUserTyping = ({ senderId }) => {
      if (senderId?.toString() === friendId.toString()) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ senderId }) => {
      if (senderId?.toString() === friendId.toString()) {
        setIsTyping(false);
      }
    };

    socketAPI.on("receive", handleReceive);
    socketAPI.on("user_typing", handleUserTyping);
    socketAPI.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socketAPI.off("receive", handleReceive);
      socketAPI.off("user_typing", handleUserTyping);
      socketAPI.off("user_stop_typing", handleUserStopTyping);
    };
  }, [friendId, currentUserId]);

  // Handle file selection (Images & PDFs)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      setFilePreviewUrl(preview);
    } else {
      setFilePreviewUrl(null);
    }

    inputRef.current?.focus();
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Input Typing & Emit Typing Status
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (friendId && currentUserId) {
      socketAPI.emit("typing", {
        senderId: currentUserId,
        receiverId: friendId,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketAPI.emit("stop_typing", {
          senderId: currentUserId,
          receiverId: friendId,
        });
      }, 1500);
    }
  };

  // Send Message (Text, Image, PDF)
  const handleSendMessage = async () => {
    const text = message.trim();
    if ((!text && !selectedFile) || !friendId || !currentUserId || isSending)
      return;

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const timeStamp = new Date().toISOString();

    const isImageFile = selectedFile?.type?.startsWith("image/");
    const isPdfFile =
      selectedFile?.type === "application/pdf" ||
      selectedFile?.name?.toLowerCase().endsWith(".pdf");

    const optimisticMsg = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: friendId,
      message: text,
      messageType: selectedFile
        ? isImageFile
          ? "image"
          : isPdfFile
            ? "pdf"
            : "file"
        : "text",
      fileUrl: filePreviewUrl || null,
      fileName: selectedFile?.name || null,
      fileSize: selectedFile?.size || null,
      fileType: selectedFile?.type || null,
      createdAt: timeStamp,
      updatedAt: timeStamp,
      pending: true,
    };

    // Optimistically add to UI
    setChatMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");
    setShowEmojiPicker(false);

    // Stop typing emitter
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketAPI.emit("stop_typing", {
      senderId: currentUserId,
      receiverId: friendId,
    });

    try {
      if (selectedFile) {
        // Upload via REST Multipart Form (stores in Cloudinary)
        const formData = new FormData();
        formData.append("receiverId", friendId);
        formData.append("message", text);
        formData.append("file", selectedFile);

        const res = await api.post("/messages/send", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const savedMessage = res.data.data;
        setChatMessages((prev) =>
          prev.map((m) => (m._id === tempId ? savedMessage : m)),
        );

        // Broadcast via socket to recipient
        socketAPI.emit("send", {
          senderID: currentUserId,
          receiverID: friendId,
          ...savedMessage,
        });

        if (onNewMessageSent) onNewMessageSent(savedMessage);
      } else {
        // Pure text message via WebSocket
        const payload = {
          senderID: currentUserId,
          receiverID: friendId,
          senderId: currentUserId,
          receiverId: friendId,
          message: text,
        };

        socketAPI.emit("send", payload, (response) => {
          if (response && response.success && response.data) {
            const saved = response.data;
            setChatMessages((prev) =>
              prev.map((m) => (m._id === tempId ? saved : m)),
            );
            if (onNewMessageSent) onNewMessageSent(saved);
          }
        });

        if (onNewMessageSent) onNewMessageSent(optimisticMsg);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(
        err.response?.data?.message || "Failed to send message / upload file",
      );
      setChatMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setIsSending(false);
      handleClearSelectedFile();
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleInsertEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Group messages by calendar date
  const groupedMessages = [];
  let lastDateLabel = null;

  chatMessages.forEach((msg, idx) => {
    const msgDateLabel = formatDateLabel(msg.createdAt);
    if (msgDateLabel !== lastDateLabel) {
      groupedMessages.push({
        type: "date-divider",
        id: `date-${msgDateLabel}-${idx}`,
        label: msgDateLabel,
      });
      lastDateLabel = msgDateLabel;
    }
    groupedMessages.push({
      type: "message",
      data: msg,
    });
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#030617] relative select-none overflow-hidden min-h-0">
      {/* ===================================================================== */}
      {/* 1. CHAT HEADER                                                        */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between px-2.5 sm:px-6 py-2.5 sm:py-3.5 bg-[#050a26]/95 border-b border-cyan-500/20 backdrop-blur-xl shrink-0 z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
          {/* Back button on mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-7 h-7 rounded-lg bg-[#081138] border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-sm hover:border-cyan-400 cursor-pointer shrink-0"
              title="Back to contacts"
            >
              <HiArrowLeft />
            </button>
          )}

          {/* User Avatar with Glowing Halo Ring */}
          <div className="relative shrink-0">
            <div className="p-[1.5px] sm:p-[2px] rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              <div className="size-8 sm:size-11 rounded-full bg-[#050a24] text-cyan-300 font-bold text-xs sm:text-base flex items-center justify-center overflow-hidden">
                {selectedFriend?.profilePic ? (
                  <img
                    src={selectedFriend.profilePic}
                    alt={selectedFriend.fullName}
                    className="size-full object-cover"
                  />
                ) : (
                  (
                    selectedFriend?.fullName?.[0] ||
                    selectedFriend?.email?.[0] ||
                    "?"
                  ).toUpperCase()
                )}
              </div>
            </div>
            {/* Online Indicator */}
            <span
              className={`absolute bottom-0 right-0 size-2.5 sm:size-3 rounded-full border-2 border-[#050a26] ${
                isOnline
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : "bg-slate-600"
              }`}
            />
          </div>

          {/* Name & Active Status */}
          <div className="text-left min-w-0 flex-1">
            <h3 className="font-extrabold text-sm sm:text-lg text-white tracking-tight truncate whitespace-nowrap">
              {selectedFriend?.fullName || "Friend"}
            </h3>
            <p className="text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 mt-0.2">
              <span
                className={`size-1.5 sm:size-2 rounded-full inline-block shrink-0 ${
                  isOnline
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : "bg-slate-500"
                }`}
              />
              <span
                className={
                  isOnline ? "text-emerald-400 font-semibold" : "text-slate-400"
                }
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </p>
          </div>
        </div>

        {/* Right Header Actions (Refresh) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-cyan-300 shrink-0">
          <button
            type="button"
            onClick={fetchChatHistory}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#091238] border border-cyan-500/30 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] flex items-center justify-center text-xs sm:text-base transition-all cursor-pointer"
            title="Reload messages"
          >
            <HiRefresh />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MESSAGES FEED                                                      */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-cyan-300/50">
            <span className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Loading conversation history...</p>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-cyan-200/50 text-center">
            <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              👋
            </div>
            <p className="text-lg font-bold text-white">No messages yet</p>
            <p className="text-xs max-w-xs text-cyan-100/60 leading-relaxed">
              Say hello or share an image with{" "}
              <strong className="text-cyan-300">
                {selectedFriend?.fullName || "your friend"}
              </strong>
              !
            </p>
          </div>
        ) : (
          groupedMessages.map((item, index) => {
            if (item.type === "date-divider") {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-center my-4"
                >
                  <span className="bg-[#071133]/80 border border-cyan-500/25 text-cyan-300 text-[11px] font-semibold px-4 py-1 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.1)] backdrop-blur-md">
                    {item.label}
                  </span>
                </div>
              );
            }

            const chat = item.data;
            const senderIdStr = (chat.senderId || chat.senderID)?.toString();
            const isSender = senderIdStr === currentUserId;
            const isImage =
              chat.messageType === "image" ||
              (chat.fileUrl && chat.fileType?.startsWith("image/"));
            const isPdf =
              chat.messageType === "pdf" ||
              chat.fileType === "application/pdf" ||
              chat.fileName?.toLowerCase().endsWith(".pdf") ||
              (chat.fileUrl && chat.fileUrl.toLowerCase().includes(".pdf"));

            return (
              <div
                key={chat._id || `msg-${chat.createdAt || "chat"}-${index}`}
                className={`w-full flex ${
                  isSender ? "justify-end" : "justify-start"
                } my-1.5`}
              >
                <div
                  className={`flex items-end gap-2.5 max-w-[90%] sm:max-w-[75%] ${
                    isSender ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Incoming Sender Avatar */}
                  {!isSender && (
                    <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shrink-0 mb-1 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                      <div className="size-7 rounded-full bg-[#050a24] text-cyan-300 font-bold text-xs flex items-center justify-center overflow-hidden">
                        {selectedFriend?.profilePic ? (
                          <img
                            src={selectedFriend.profilePic}
                            alt={selectedFriend.fullName}
                            className="size-full object-cover"
                          />
                        ) : (
                          (selectedFriend?.fullName?.[0] || "?").toUpperCase()
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      isSender ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`relative text-sm tracking-wide transition-all ${
                        isSender
                          ? "bg-gradient-to-r from-[#6b11ff] via-[#851de6] to-[#b014b8] text-white rounded-2xl rounded-tr-xs shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-fuchsia-400/30"
                          : "bg-[#071638]/95 text-white rounded-2xl rounded-tl-xs shadow-[0_0_15px_rgba(0,240,255,0.1)] border border-cyan-500/35"
                      } ${
                        isImage ? "p-1.5 overflow-hidden" : "px-4 py-2.5"
                      }`}
                    >
                      {/* IMAGE ATTACHMENT */}
                      {isImage && (chat.fileUrl || chat._id) && (
                        <div
                          className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/10"
                          onClick={() =>
                            setLightboxImage({
                              url: chat.fileUrl || getFileStreamUrl(chat),
                              name: chat.fileName || "Image",
                            })
                          }
                        >
                          <img
                            src={chat.fileUrl || getFileStreamUrl(chat)}
                            alt="Sent image"
                            className="max-h-72 w-auto max-w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-103"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                            <span>🔍</span> Click for Preview
                          </div>
                        </div>
                      )}

                      {/* PDF / DOCUMENT ATTACHMENT */}
                      {isPdf && (chat.fileUrl || chat._id) && (
                        <div
                          className="p-3 bg-[#050c26]/90 rounded-xl border border-cyan-500/30 min-w-[240px] cursor-pointer hover:border-cyan-400 transition-all"
                          onClick={() =>
                            setActivePdfModal({
                              url: getFileStreamUrl(chat),
                              name: chat.fileName || "Document.pdf",
                              chat: chat,
                            })
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0 font-bold border border-rose-500/40">
                              <HiDocumentText />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p
                                className="font-bold text-xs truncate text-white"
                                title={chat.fileName || "Document.pdf"}
                              >
                                {chat.fileName || "Document.pdf"}
                              </p>
                              <p className="text-[10px] text-cyan-200/60 mt-0.5">
                                {chat.fileSize
                                  ? formatFileSize(chat.fileSize)
                                  : "PDF Document"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2.5">
                            <button
                              type="button"
                              className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <HiEye className="text-sm" /> Preview Document
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TEXT CONTENT */}
                      {chat.message && (
                        <div
                          className={`leading-relaxed break-words ${
                            isImage ? "px-2 py-1.5 text-sm" : ""
                          }`}
                        >
                          {chat.message}
                        </div>
                      )}

                      {/* Time & Read Status Inside Bubble */}
                      <div
                        className={`flex items-center gap-1 text-[10px] mt-1 ${
                          isSender
                            ? "justify-end text-purple-200/70"
                            : "justify-end text-cyan-300/60"
                        }`}
                      >
                        <span>{formatTime(chat.createdAt)}</span>
                        {isSender && (
                          <span
                            className="font-bold text-cyan-300"
                            title={chat.pending ? "Sending..." : "Delivered"}
                          >
                            {chat.pending ? "🕒" : "✓✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="w-full flex justify-start my-2">
            <div className="flex items-center gap-2">
              <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shrink-0">
                <div className="size-6 rounded-full bg-[#050a24] text-cyan-300 font-bold text-[10px] flex items-center justify-center overflow-hidden">
                  {selectedFriend?.profilePic ? (
                    <img
                      src={selectedFriend.profilePic}
                      alt={selectedFriend.fullName}
                      className="size-full object-cover"
                    />
                  ) : (
                    (selectedFriend?.fullName?.[0] || "?").toUpperCase()
                  )}
                </div>
              </div>

              <div className="bg-[#071638]/95 border border-cyan-500/40 py-2 px-3.5 rounded-2xl rounded-tl-xs shadow-[0_0_12px_rgba(0,240,255,0.15)] flex items-center gap-1.5">
                <span
                  className="size-1.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_#00f0ff]"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="size-1.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_#00f0ff]"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_#00f0ff]"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-xs text-cyan-200/60 ml-1.5 font-medium italic">
                  {selectedFriend?.fullName?.split(" ")[0]} is typing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===================================================================== */}
      {/* 3. SELECTED FILE UPLOAD PREVIEW                                       */}
      {/* ===================================================================== */}
      {selectedFile && (
        <div className="px-4 py-2 bg-[#050a26]/95 border-t border-cyan-500/25 flex items-center justify-between gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Selected preview"
                className="size-12 rounded-lg object-cover border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)] shrink-0"
              />
            ) : (
              <div className="size-12 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-2xl shrink-0 font-bold">
                <HiDocumentText />
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-cyan-200/60">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>

          <button
            onClick={handleClearSelectedFile}
            className="w-7 h-7 rounded-lg bg-[#091238] border border-cyan-500/30 text-cyan-300 hover:text-rose-400 hover:border-rose-400 flex items-center justify-center transition-all cursor-pointer"
            title="Remove attachment"
          >
            <HiX />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. EMOJI PICKER POPUP                                                 */}
      {/* ===================================================================== */}
      {showEmojiPicker && (
        <div className="px-4 py-3 bg-[#050a26]/95 border-t border-cyan-500/25 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
            <span className="text-xs font-bold text-cyan-300">
              Quick Emojis
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-cyan-300/60 hover:text-cyan-300 cursor-pointer text-xs"
            >
              <HiX />
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5 max-h-28 overflow-y-auto custom-scrollbar">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="text-2xl hover:scale-130 transition-transform p-1 rounded-lg hover:bg-cyan-500/20 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. FLOATING BOTTOM INPUT TOOLBAR                                      */}
      {/* ===================================================================== */}
      <div className="p-3 sm:p-4 bg-[#050a26]/95 border-t border-cyan-500/20 flex items-center gap-2.5 shrink-0 backdrop-blur-xl z-20">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full bg-[#081138] border border-cyan-500/35 hover:border-cyan-400 text-cyan-300 hover:text-white flex items-center justify-center text-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer shrink-0"
          title="Attach Image or PDF"
        >
          <HiPaperClip />
        </button>

        {/* Main Floating Capsule Input Container */}
        <div className="flex-1 relative flex items-center bg-[#070e30]/90 rounded-full border border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-white placeholder-cyan-200/40 text-sm focus:outline-none pr-8"
            placeholder={
              selectedFile
                ? "Add a caption... (Press Enter to send)"
                : "Type a message..."
            }
            onChange={handleInputChange}
            value={message}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          {/* Emoji Toggle Icon Button inside input */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="absolute right-3.5 text-cyan-300/70 hover:text-cyan-300 hover:scale-110 text-xl transition-all cursor-pointer"
            title="Insert Emoji"
          >
            <HiEmojiHappy />
          </button>
        </div>

        {/* Glowing Cyan/Blue Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && !selectedFile) || isSending}
          className="size-10 sm:size-11 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#0070f3] text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.7)] hover:scale-108 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          title="Send message"
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiPaperAirplane className="text-lg rotate-90 ml-0.5" />
          )}
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 6. FULLSCREEN IMAGE LIGHTBOX MODAL                                    */}
      {/* ===================================================================== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-black/80 border border-cyan-400 text-cyan-300 hover:text-white flex items-center justify-center text-lg shadow-xl cursor-pointer"
              title="Close preview (Esc)"
            >
              <HiX />
            </button>

            <img
              src={
                typeof lightboxImage === "string"
                  ? lightboxImage
                  : lightboxImage.url
              }
              alt="Full preview"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-[0_0_50px_rgba(0,240,255,0.3)] border border-cyan-400/40 select-none"
            />

            {typeof lightboxImage === "object" && lightboxImage.name && (
              <p className="text-cyan-200/80 text-xs mt-3 px-4 py-1.5 bg-[#060c28]/80 border border-cyan-500/30 rounded-full truncate max-w-md backdrop-blur-md shadow-md">
                {lightboxImage.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. PDF INTERACTIVE VIEWER MODAL                                       */}
      {/* ===================================================================== */}
      {activePdfModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setActivePdfModal(null)}
        >
          <div
            className="bg-[#060b24] rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden border border-cyan-400/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#050a22] border-b border-cyan-500/25">
              <div className="flex items-center gap-2.5 min-w-0 text-left">
                <span className="text-xl">📄</span>
                <p
                  className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-md"
                  title={activePdfModal.name}
                >
                  {activePdfModal.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  ↗️ Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setActivePdfModal(null)}
                  className="w-8 h-8 rounded-lg bg-[#091238] border border-cyan-500/30 text-cyan-300 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                  title="Close (Esc)"
                >
                  <HiX />
                </button>
              </div>
            </div>

            {/* Embedded Native PDF Viewer */}
            <div className="flex-1 bg-[#030617] p-2 min-h-[500px] h-[78vh]">
              <iframe
                src={`${activePdfModal.url}#toolbar=1`}
                title={activePdfModal.name}
                className="w-full h-full rounded-xl border border-cyan-500/20 bg-white shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatting;
