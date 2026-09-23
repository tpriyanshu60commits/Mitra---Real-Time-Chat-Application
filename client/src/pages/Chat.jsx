import {
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
import {
  HiSearch,
  HiRefresh,
  HiX,
} from "react-icons/hi";

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
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "now";
  } else if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays === 1) {
    return "1d";
  } else if (diffDays < 7) {
    return `${diffDays}d`;
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
  }, [user]);

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

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } transition-all duration-300 flex items-center gap-3 cursor-pointer bg-[#070d2b]/95 backdrop-blur-xl p-3 rounded-2xl border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] max-w-sm`}
              onClick={() => {
                toast.dismiss(t.id);
                if (senderObj) {
                  handleSelectFriend(senderObj);
                }
              }}
            >
              <div className="size-10 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.6)] shrink-0 overflow-hidden border border-cyan-400/40">
                {senderObj?.profilePic ? (
                  <img
                    src={senderObj.profilePic}
                    alt={senderName}
                    className="size-full object-cover"
                  />
                ) : (
                  (senderName[0] || "U").toUpperCase()
                )}
              </div>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-cyan-300 truncate">
                    {senderName}
                  </p>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-cyan-100/75 truncate max-w-[200px]">
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
  }, [contacts, searchQuery, conversationsMeta, user?._id]);

  return (
    <>
      {isLogin && (
        <div className="h-[calc(100vh-57px)] sm:h-[calc(100vh-61px)] w-full bg-[#030617] text-white overflow-hidden flex select-none m-0 p-0">
          {/* ================================================================= */}
          {/* LEFT SIDEBAR: Conversations List                                  */}
          {/* ================================================================= */}
          <div
            className={`w-full md:w-80 lg:w-[350px] shrink-0 border-r border-cyan-500/20 bg-[#050a26] flex flex-col h-full overflow-hidden z-10 ${
              selectedFriend ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search & Refresh in the same line */}
            <div className="p-3 sm:p-3.5 border-b border-cyan-500/20 shrink-0">
              <div className="flex items-center gap-2">
                {/* Search Conversations Input */}
                <div className="relative flex-1 flex items-center bg-[#070e30]/90 rounded-xl border border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/30 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all">
                  <HiSearch className="text-cyan-400 text-sm ml-3 shrink-0 opacity-80" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent py-2 px-2.5 text-white placeholder-cyan-200/40 text-xs focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mr-2.5 text-cyan-300/60 hover:text-cyan-300 cursor-pointer text-xs"
                    >
                      <HiX />
                    </button>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={loadChatData}
                  title="Refresh conversations"
                  className="w-9 h-9 rounded-xl bg-[#091238] border border-cyan-500/35 text-cyan-300 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <HiRefresh className="text-base" />
                </button>
              </div>
            </div>

            {/* Contacts / Conversations Feed */}
            <div className="overflow-y-auto flex-1 min-h-0 p-2 space-y-1">
              {loadingContacts ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-cyan-300/50">
                  <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-[#0b163d] border border-cyan-400/60 shadow-[0_0_18px_rgba(0,240,255,0.2)]"
                          : "bg-[#060b24]/40 hover:bg-[#0a1338]/70 border border-transparent hover:border-cyan-500/20"
                      }`}
                    >
                      {/* Avatar with Cyber Dual-Ring Glow & Status Indicator */}
                      <div className="relative shrink-0">
                        <div className="p-[2px] rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                          <div className="size-10 rounded-full bg-[#050a24] text-cyan-300 font-bold text-sm flex items-center justify-center overflow-hidden">
                            {friend.profilePic ? (
                              <img
                                src={friend.profilePic}
                                alt={friend.fullName}
                                className="size-full object-cover"
                              />
                            ) : (
                              (
                                friend.fullName?.[0] ||
                                friend.email?.[0] ||
                                "U"
                              ).toUpperCase()
                            )}
                          </div>
                        </div>

                        {/* Online / Offline Dot */}
                        <span
                          className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#050a26] ${
                            isFriendOnline
                              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                              : "bg-slate-600"
                          }`}
                          title={isFriendOnline ? "Online" : "Offline"}
                        />
                      </div>

                      {/* Friend Info & Last Message Snippet */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-bold text-sm text-white truncate tracking-wide">
                            {friend.fullName}
                          </p>
                          {meta?.lastMessageAt && (
                            <span className="text-[11px] text-cyan-300/50 shrink-0 font-medium">
                              {formatTimeAgo(meta.lastMessageAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-cyan-100/60 truncate">
                            {meta?.lastMessage || friend.email}
                          </p>
                          {unread > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold text-[10px] shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.6)]">
                              {unread > 9 ? "9+" : unread}
                            </span>
                          ) : (
                            isFriendOnline && (
                              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-52 text-cyan-300/40 gap-2 px-4 text-center">
                  <span className="text-3xl">👥</span>
                  <p className="text-sm font-semibold text-white/80">
                    No contacts found
                  </p>
                  <p className="text-xs text-cyan-200/40">
                    {searchQuery
                      ? "Try a different search term"
                      : "Registered users will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT MAIN CHAT AREA                                              */}
          {/* ================================================================= */}
          <div
            className={`flex-1 flex flex-col h-full bg-[#03071e] overflow-hidden min-h-0 z-10 ${
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
              <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-5">
                <div className="relative">
                  <div className="size-24 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-fuchsia-500/20 to-blue-500/10 border border-cyan-400/40 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(0,240,255,0.3)]">
                    💬
                  </div>
                  <span className="absolute -bottom-2 -right-2 text-2xl animate-pulse">
                    ✨
                  </span>
                </div>

                <div className="max-w-md">
                  <h3 className="text-3xl font-black tracking-tight text-white">
                    Welcome to{" "}
                    <span
                      className="text-cyan-300"
                      style={{
                        textShadow: "0 0 15px rgba(0, 240, 255, 0.9)",
                      }}
                    >
                      Mitra Chat
                    </span>
                  </h3>
                  <p className="text-sm text-cyan-100/70 mt-2 leading-relaxed">
                    Select any contact from the left sidebar to start chatting
                    with instant real-time messaging, glowing cyber aesthetics,
                    and seamless media sharing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
