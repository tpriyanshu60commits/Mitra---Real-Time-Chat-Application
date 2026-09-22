import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Chatting from "../components/chat/Chatting";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import socketAPI from "../config/webSocket";
import toast from "react-hot-toast";

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(
      880,
      audioCtx.currentTime + 0.08,
    ); // A5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.22);
  } catch {
    // Graceful fallback if audio is blocked
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

const Chat = () => {
  const navigate = useNavigate();
  const { user, isLogin } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [conversationsMeta, setConversationsMeta] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loadingContacts, setLoadingContacts] = useState(true);

  const contactsRef = useRef(contacts);
  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const selectedFriendRef = useRef(selectedFriend);
  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  // Fetch all users and conversation previews
  const loadChatData = useCallback(async () => {
    try {
      setLoadingContacts(true);
      const [usersRes, convosRes] = await Promise.allSettled([
        api.get("/user/allusers"),
        api.get("/messages/conversations"),
      ]);

      let myId = user?._id?.toString();
      if (!myId) {
        try {
          const stored = JSON.parse(sessionStorage.getItem("AppUser"));
          myId = stored?._id?.toString();
        } catch {
          // ignore
        }
      }

      if (usersRes.status === "fulfilled" && usersRes.value.data?.data) {
        const contactList = usersRes.value.data.data.filter(
          (u) => u._id?.toString() !== myId,
        );
        setContacts(contactList);
      }

      if (convosRes.status === "fulfilled" && convosRes.value.data?.data) {
        const metaMap = {};
        const unreadMap = {};
        convosRes.value.data.data.forEach((conv) => {
          if (conv._id) {
            const friendId = conv._id.toString();
            metaMap[friendId] = {
              lastMessage: conv.lastMessage,
              lastMessageAt: conv.lastMessageAt,
            };
            if (conv.unreadCount > 0) {
              unreadMap[friendId] = conv.unreadCount;
            }
          }
        });
        setConversationsMeta(metaMap);
        setUnreadCounts(unreadMap);
      }
    } catch (error) {
      console.error("Failed to load contacts data:", error);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const updateConversationSnippet = useCallback(
    (friendId, messageText, timestamp = new Date().toISOString()) => {
      if (!friendId) return;
      const strId = friendId.toString();
      setConversationsMeta((prev) => ({
        ...prev,
        [strId]: {
          lastMessage: messageText,
          lastMessageAt: timestamp,
        },
      }));
    },
    [],
  );

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    if (friend?._id) {
      const fId = friend._id.toString();
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[fId];
        return updated;
      });
    }
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }

    if (!user?._id) return;
    const currentUserId = user._id.toString();

    // Register with socket
    socketAPI.emit("register", currentUserId);
    socketAPI.emit("OmBhramyaNamah", currentUserId);

    // Initial load
    loadChatData();

    // Handle reconnects
    const handleConnect = () => {
      console.log("Socket reconnected. Registering user:", currentUserId);
      socketAPI.emit("register", currentUserId);
      socketAPI.emit("OmBhramyaNamah", currentUserId);
    };

    // Handle online users broadcast
    const handleOnlineUsers = (usersMap) => {
      if (usersMap && typeof usersMap === "object") {
        setOnlineUsers(usersMap);
      }
    };

    // Global receive handler for unread badges and notifications
    const handleGlobalReceive = (incomingMsg) => {
      if (!incomingMsg?.senderId) return;
      const senderId = incomingMsg.senderId.toString();

      updateConversationSnippet(
        senderId,
        incomingMsg.message,
        incomingMsg.createdAt,
      );

      const activeFriend = selectedFriendRef.current;
      // If message is from a background chat (not currently active)
      if (!activeFriend || activeFriend._id?.toString() !== senderId) {
        playNotificationSound();

        // Increment unread count
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));

        // Find sender name from current contacts ref
        const senderObj = contactsRef.current.find(
          (c) => c._id?.toString() === senderId,
        );
        const senderName = senderObj?.fullName || "Someone";

        toast(
          (t) => (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                toast.dismiss(t.id);
                if (senderObj) {
                  handleSelectFriend(senderObj);
                }
              }}
            >
              <div className="avatar avatar-placeholder shrink-0">
                <div className="size-8 rounded-full bg-primary text-primary-content font-bold text-xs flex items-center justify-center">
                  {(senderName[0] || "U").toUpperCase()}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-base-content">
                  {senderName}
                </p>
                <p className="text-xs text-base-content/70 truncate max-w-[180px]">
                  {incomingMsg.message}
                </p>
              </div>
            </div>
          ),
          { duration: 4000, position: "top-right" },
        );
      }
    };

    socketAPI.on("connect", handleConnect);
    socketAPI.on("onlineUsers", handleOnlineUsers);
    socketAPI.on("receive", handleGlobalReceive);

    return () => {
      socketAPI.off("connect", handleConnect);
      socketAPI.off("onlineUsers", handleOnlineUsers);
      socketAPI.off("receive", handleGlobalReceive);
      socketAPI.emit("unregister", currentUserId);
      socketAPI.emit("OmNamahShivay", currentUserId);
    };
  }, [isLogin, user?._id, loadChatData, updateConversationSnippet, navigate]);

  const filteredAndSortedContacts = useMemo(() => {
    let myId = user?._id?.toString();
    if (!myId) {
      try {
        const stored = JSON.parse(sessionStorage.getItem("AppUser"));
        myId = stored?._id?.toString();
      } catch {
        // ignore
      }
    }
    let result = contacts.filter((c) => c._id?.toString() !== myId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      const aTime = conversationsMeta[a._id]?.lastMessageAt;
      const bTime = conversationsMeta[b._id]?.lastMessageAt;
      if (aTime && bTime) return new Date(bTime) - new Date(aTime);
      if (aTime) return -1;
      if (bTime) return 1;
      return 0;
    });

    return result;
  }, [contacts, searchQuery, conversationsMeta]);

  return (
    <>
      {isLogin && (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-base-100">
          {/* Sidebar */}
          <div
            className={`w-full md:w-80 lg:w-96 shrink-0 bg-base-100 border-r border-base-300 flex flex-col transition-all ${
              selectedFriend ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header & Search */}
            <div className="p-4 border-b border-base-300 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <span>Chats</span>
                    <span className="badge badge-primary badge-sm">
                      {contacts.length}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={loadChatData}
                  title="Refresh contacts"
                  className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
                >
                  🔄
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm input-bordered w-full pl-8 text-xs focus:outline-primary"
                />
                <span className="absolute left-2.5 top-2 text-xs text-base-content/40">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1.5 text-xs text-base-content/40 hover:text-base-content"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Contacts List */}
            <div className="overflow-y-auto flex-1 divide-y divide-base-200/50">
              {loadingContacts ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-base-content/40">
                  <span className="loading loading-spinner loading-md text-primary" />
                  <p className="text-xs">Loading conversations...</p>
                </div>
              ) : filteredAndSortedContacts.length > 0 ? (
                filteredAndSortedContacts.map((friend) => {
                  const friendId = friend._id?.toString();
                  const isFriendOnline = Boolean(onlineUsers[friendId]);
                  const meta = conversationsMeta[friendId];
                  const unread = unreadCounts[friendId] || 0;
                  const isSelected =
                    selectedFriend?._id?.toString() === friendId;

                  return (
                    <div
                      key={friendId}
                      onClick={() => handleSelectFriend(friend)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-base-200/70 transition-all ${
                        isSelected
                          ? "bg-primary/10 border-l-4 border-primary font-medium"
                          : "border-l-4 border-transparent"
                      }`}
                    >
                      {/* Avatar with Online Indicator */}
                      <div className="relative shrink-0">
                        <div className="avatar avatar-placeholder">
                          <div className="size-11 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center ring-1 ring-base-300">
                            {(
                              friend.fullName?.[0] ||
                              friend.email?.[0] ||
                              "U"
                            ).toUpperCase()}
                          </div>
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-base-100 ${
                            isFriendOnline ? "bg-success" : "bg-base-content/20"
                          }`}
                          title={isFriendOnline ? "Online" : "Offline"}
                        />
                      </div>

                      {/* Info & Last message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-semibold text-sm text-base-content truncate">
                            {friend.fullName}
                          </p>
                          {meta?.lastMessageAt && (
                            <span className="text-[11px] text-base-content/40 shrink-0">
                              {formatTimeAgo(meta.lastMessageAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-base-content/50 truncate">
                            {meta?.lastMessage || friend.email}
                          </p>
                          {unread > 0 && (
                            <span className="badge badge-primary badge-xs size-5 rounded-full font-bold shrink-0">
                              {unread > 9 ? "9+" : unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-52 text-base-content/40 gap-2 px-4 text-center">
                  <span className="text-4xl">👥</span>
                  <p className="text-sm font-medium">No contacts found</p>
                  <p className="text-xs text-base-content/30">
                    {searchQuery
                      ? "Try a different search term"
                      : "Registered users will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 flex flex-col bg-base-200 overflow-hidden ${
              !selectedFriend ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedFriend ? (
              <Chatting
                key={selectedFriend._id}
                selectedFriend={selectedFriend}
                currentUser={user}
                isOnline={Boolean(onlineUsers[selectedFriend._id?.toString()])}
                onBack={() => setSelectedFriend(null)}
                onNewMessageSent={(savedMsg) => {
                  updateConversationSnippet(
                    selectedFriend._id?.toString(),
                    savedMsg.message,
                    savedMsg.createdAt,
                  );
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-base-content/40 gap-4 p-8 text-center">
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl shadow-inner">
                  💬
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-base-content">
                    Welcome to Mingo Chat
                  </h3>
                  <p className="text-sm text-base-content/60 mt-1 max-w-sm">
                    Select any contact from the left sidebar to start messaging
                    in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}{" "}
    </>
  );
};

export default Chat;
