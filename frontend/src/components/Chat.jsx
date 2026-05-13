import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Chat({ selectedUser }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const otherUserId = selectedUser?.id;

  useEffect(() => {
    if (!otherUserId) return;
    api
      .get(`/messages/${otherUserId}`)
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !otherUserId) return;
    try {
      const res = await api.post("/messages", {
        receiverId: otherUserId,
        content: text.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedUser)
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow">
        <p className="text-4xl mb-3">💬</p>
        <p className="text-gray-500">
          Selecciona un usuario para iniciar una conversación.
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow flex flex-col h-[500px]">
      <div className="px-5 py-4 border-b flex items-center gap-3">
        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
          {selectedUser.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">
            {selectedUser.name}
          </p>
          <p className="text-xs text-gray-400">{selectedUser.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Inicia la conversación 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMine ? "bg-green-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${isMine ? "text-green-200" : "text-gray-400"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="px-5 py-3 border-t flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
