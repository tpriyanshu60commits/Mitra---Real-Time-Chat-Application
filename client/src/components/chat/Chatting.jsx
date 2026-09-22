import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import socketAPI from "../../config/webSocket";
import toast from "react-hot-toast";

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
    <div className="flex flex-col h-full bg-base-200/50 relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-b border-base-300 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-ghost btn-sm btn-circle md:hidden text-base-content/70"
              title="Back to contacts"
            >
              ←
            </button>
          )}

          <div className="relative">
            <div className="avatar avatar-placeholder">
              <div className="size-10 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center ring-2 ring-base-200">
                {(
                  selectedFriend?.fullName?.[0] ||
                  selectedFriend?.email?.[0] ||
                  "?"
                ).toUpperCase()}
              </div>
            </div>
            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-base-100 ${
                isOnline ? "bg-success" : "bg-base-content/20"
              }`}
            />
          </div>

          <div>
            <h3 className="font-bold text-sm md:text-base text-base-content">
              {selectedFriend?.fullName || "Friend"}
            </h3>
            <p className="text-xs flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full inline-block ${
                  isOnline ? "bg-success" : "bg-base-content/30"
                }`}
              />
              <span
                className={
                  isOnline ? "text-success font-medium" : "text-base-content/40"
                }
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-base-content/50">
          <button
            onClick={fetchChatHistory}
            className="btn btn-ghost btn-xs btn-circle hover:text-base-content"
            title="Reload messages"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-base-content/40">
            <span className="loading loading-spinner loading-md text-primary" />
            <p className="text-xs">Loading message history...</p>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-base-content/40 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-1">
              👋
            </div>
            <p className="text-base font-semibold text-base-content">
              No messages yet
            </p>
            <p className="text-xs max-w-xs text-base-content/60">
              Say hello or share a photo/document with{" "}
              {selectedFriend?.fullName || "your friend"}!
            </p>
          </div>
        ) : (
          groupedMessages.map((item) => {
            if (item.type === "date-divider") {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-center my-3"
                >
                  <span className="bg-base-300/80 text-base-content/60 text-[11px] font-medium px-3 py-1 rounded-full shadow-xs">
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
                key={chat._id || `msg-${chat.createdAt}-${Math.random()}`}
                className={`w-full flex ${isSender ? "justify-end" : "justify-start"} my-1`}
              >
                <div
                  className={`flex flex-col ${
                    isSender ? "items-end" : "items-start"
                  } max-w-[85%] sm:max-w-[70%]`}
                >
                  {/* Sender Header */}
                  <span
                    className={`text-[11px] font-semibold text-base-content/40 mb-0.5 px-1 ${
                      isSender ? "text-right" : "text-left"
                    }`}
                  >
                    {isSender ? "You" : selectedFriend?.fullName || "Friend"}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl text-sm shadow-sm overflow-hidden ${
                      isSender
                        ? "bg-primary text-primary-content rounded-tr-xs"
                        : "bg-base-100 text-base-content border border-base-300 rounded-tl-xs"
                    }`}
                  >
                    {/* IMAGE ATTACHMENT */}
                    {isImage && (chat.fileUrl || chat._id) && (
                      <div
                        className="relative group cursor-pointer overflow-hidden max-w-sm rounded-t-xl"
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
                          className="max-h-72 w-auto object-cover rounded-t-xl transition-transform duration-200 group-hover:scale-102"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                          <span>🔍</span> Click for Full Preview
                        </div>
                      </div>
                    )}

                    {/* PDF / DOCUMENT ATTACHMENT */}
                    {isPdf && (chat.fileUrl || chat._id) && (
                      <div
                        className="p-3 bg-base-200/50 rounded-t-xl border-b border-base-300/40 min-w-[240px] cursor-pointer hover:bg-base-200/80 transition-colors"
                        onClick={() =>
                          setActivePdfModal({
                            url: getFileStreamUrl(chat),
                            name: chat.fileName || "Document.pdf",
                            chat: chat,
                          })
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-error/10 text-error flex items-center justify-center text-2xl shrink-0 font-bold shadow-xs">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-xs truncate text-base-content"
                              title={chat.fileName || "Document.pdf"}
                            >
                              {chat.fileName || "Document.pdf"}
                            </p>
                            <p className="text-[11px] text-base-content/50">
                              {chat.fileSize
                                ? formatFileSize(chat.fileSize)
                                : "PDF Document"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <button
                            type="button"
                            className="btn btn-xs btn-primary w-full gap-1.5 shadow-xs font-semibold"
                          >
                            👁️ Preview Document
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TEXT CONTENT / CAPTION */}
                    {chat.message && (
                      <div className="px-4 py-2.5 leading-relaxed break-words">
                        {chat.message}
                      </div>
                    )}
                  </div>

                  {/* Footer Timestamp & Status */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-base-content/40 mt-0.5 px-1 ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{formatTime(chat.createdAt)}</span>
                    {isSender && (
                      <span title={chat.pending ? "Sending..." : "Delivered"}>
                        {chat.pending ? "🕒" : "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="w-full flex justify-start my-1">
            <div className="flex flex-col items-start max-w-[82%] sm:max-w-[70%]">
              <div className="bg-base-100 border border-base-300 text-base-content py-2 px-3.5 rounded-2xl rounded-tl-xs shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="size-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="size-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span className="text-xs text-base-content/50 ml-1 italic">
                    {selectedFriend?.fullName?.split(" ")[0]} is typing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Upload Preview Box */}
      {selectedFile && (
        <div className="px-4 py-2 bg-base-100 border-t border-base-300 shadow-md flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Selected preview"
                className="size-12 rounded-lg object-cover ring-1 ring-base-300 shrink-0"
              />
            ) : (
              <div className="size-12 rounded-lg bg-error/10 text-error flex items-center justify-center text-2xl shrink-0 font-bold">
                📄
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-base-content truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-base-content/50">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>

          <button
            onClick={handleClearSelectedFile}
            className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error"
            title="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-base-100 border-t border-base-300 shadow-lg">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-base-200">
            <span className="text-xs font-semibold text-base-content/60">
              Quick Emojis
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-xs text-base-content/40 hover:text-base-content"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="text-xl hover:scale-125 transition-transform p-1 rounded-sm hover:bg-base-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Box */}
      <div className="p-3 bg-base-100 border-t border-base-300 flex items-end gap-2 shrink-0">
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
          className="btn btn-ghost btn-sm btn-circle text-lg shrink-0 text-base-content/70 hover:text-primary"
          title="Attach Image or PDF"
        >
          📎
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`btn btn-ghost btn-sm btn-circle text-xl shrink-0 ${
            showEmojiPicker ? "bg-base-200" : ""
          }`}
          title="Insert Emoji"
        >
          😊
        </button>

        {/* Text Input */}
        <textarea
          ref={inputRef}
          className="textarea textarea-bordered flex-1 resize-none text-sm min-h-[42px] max-h-32 leading-normal focus:outline-primary"
          placeholder={
            selectedFile
              ? "Add a caption... (Optional, Enter to send)"
              : "Type a message... (Press Enter to send, Shift+Enter for newline)"
          }
          onChange={handleInputChange}
          value={message}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="btn btn-primary btn-circle shrink-0 shadow-sm"
          disabled={(!message.trim() && !selectedFile) || isSending}
          title="Send message"
        >
          {isSending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[95vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <div className="absolute top-2 right-2 sm:top-0 sm:right-0 z-10">
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="btn btn-circle btn-sm sm:btn-md bg-black/70 hover:bg-black text-white border border-white/20 shadow-xl"
                title="Close preview (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Enlarged Image Preview */}
            <img
              src={
                typeof lightboxImage === "string"
                  ? lightboxImage
                  : lightboxImage.url
              }
              alt="Full size preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10 select-none"
            />

            {typeof lightboxImage === "object" && lightboxImage.name && (
              <p className="text-white/80 text-xs mt-3 px-4 py-1.5 bg-black/60 rounded-full truncate max-w-md backdrop-blur-md shadow-md">
                {lightboxImage.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* PDF Interactive Viewer Modal */}
      {activePdfModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
          onClick={() => setActivePdfModal(null)}
        >
          <div
            className="bg-base-100 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-base-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">📄</span>
                <p
                  className="font-bold text-sm text-base-content truncate max-w-[200px] sm:max-w-md"
                  title={activePdfModal.name}
                >
                  {activePdfModal.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-ghost gap-1.5 text-base-content hover:bg-base-300"
                  title="Open full PDF in a new browser tab"
                >
                  ↗️ Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setActivePdfModal(null)}
                  className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded Native PDF Viewer */}
            <div className="flex-1 bg-base-300/40 p-2 min-h-[500px] h-[78vh]">
              <iframe
                src={`${activePdfModal.url}#toolbar=1`}
                title={activePdfModal.name}
                className="w-full h-full rounded-xl border border-base-300 bg-white shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatting;
