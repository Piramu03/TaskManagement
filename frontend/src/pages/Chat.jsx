import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import { connectChatSocket, sendChatMessage } from "../wsClient";

export default function GroupChat() {
  const { groupId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // ================= LOAD USER & HISTORY =================
  useEffect(() => {
    API.get("/auth/me", authHeader).then(res => setMe(res.data));
    API.get(`/chat/${groupId}`, authHeader).then(res =>
      setMessages(res.data || [])
    );
  }, [groupId]);

  // ================= WEBSOCKET =================
  useEffect(() => {
    connectChatSocket(
      `ws://localhost:8000/chat/ws/${groupId}?token=${token}`,
      (data) => setMessages(prev => [...prev, data]),
      () => setSocketReady(true),
      () => setSocketReady(false)
    );
  }, [groupId, token]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND TEXT =================
  const sendMessage = () => {
    if (!text.trim() || !socketReady) return;
    sendChatMessage({ type: "text", message: text });
    setText("");
  };

  // ================= UPLOAD FILE =================
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await API.post("/chat/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return res.data;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploaded = await uploadFile(file);

    sendChatMessage({
      type: "file",
      file_url: uploaded.file_url,
      file_name: uploaded.file_name,
      file_type: uploaded.file_type
    });

    e.target.value = "";
  };

  // ================= DATE HELPERS =================
  const formatDateHeader = (iso) => {
    const d = new Date(iso);
    const today = new Date();

    if (d.toDateString() === today.toDateString()) return "Today";

    const y = new Date();
    y.setDate(today.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#E8D8C4]">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold text-[#561C24] mb-4">
          Group Chat
        </h1>

        {/* ================= MESSAGES ================= */}
        <div className="flex-1 bg-[#F6EEE4] rounded-xl p-4 overflow-y-auto mb-4">
          {messages.map((m, i) => {
            const isMe = me && m.sender_id === me.user_id;

            const showDate =
              i === 0 ||
              new Date(m.time).toDateString() !==
                new Date(messages[i - 1].time).toDateString();

            return (
              <div key={i}>
                {/* DATE HEADER */}
                {showDate && (
                  <div className="text-center text-xs text-gray-500 my-4">
                    {formatDateHeader(m.time)}
                  </div>
                )}

                {/* MESSAGE */}
                <div
                  className={`mb-3 flex ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-xs">
                    {/* SENDER + TIME */}
                    <div className="text-xs text-gray-500 mb-1">
                      {m.sender || "Unknown"} • {formatTime(m.time)}
                    </div>

                    <div
                      className={`p-2 rounded-lg shadow ${
                        isMe
                          ? "bg-[#561C24] text-white"
                          : "bg-white"
                      }`}
                    >
                      {/* TEXT */}
                      {m.type === "text" && <div>{m.message}</div>}

                      {/* FILE / IMAGE */}
                      {m.type === "file" && (
                        <>
                          {m.file_type?.startsWith("image/") ? (
                            <img
                              src={`http://localhost:8000${m.file_url}`}
                              alt={m.file_name}
                              className="max-w-xs rounded-lg"
                            />
                          ) : (
                            <a
                              href={`http://localhost:8000${m.file_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              📄 {m.file_name}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ================= INPUT ================= */}
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleFileSelect}
          />

          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-[#561C24] text-white px-3 rounded-lg"
          >
            📎
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!socketReady}
            placeholder={
              socketReady ? "Type a message..." : "Connecting to chat..."
            }
            className="flex-1 p-2 rounded-lg border"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            disabled={!socketReady}
            className="bg-[#561C24] text-white px-4 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
