import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notifications", authHeader);
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (type) => {
    if (type === "overdue") return "⚠️ Task Overdue";
    if (type === "due_tomorrow") return "⏰ Task Due Tomorrow";
    if (type === "high_priority") return "🔥 High Priority Task";
    return "🔔 Notification";
  };

  return (
    <div className="min-h-screen bg-[#E8D8C4]">
      <Navbar />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#561C24] mb-6">
          Notifications
        </h1>

        {loading ? (
          <div className="text-[#561C24]">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-[#561C24]">
            🎉 No notifications right now
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, index) => (
              <div
                key={index}
                className="bg-[#F6EEE4] border-l-4 border-[#6D2932]
                           rounded-xl p-4 shadow"
              >
                <h3 className="font-semibold text-[#6D2932] mb-2">
                  {getLabel(n.type)}
                </h3>

                <p className="text-sm text-[#3B0D14]">
                  <strong>Title:</strong> {n.title}
                </p>
                <p className="text-sm text-[#3B0D14]">
                  <strong>Priority:</strong> {n.priority}
                </p>
                <p className="text-sm text-[#3B0D14]">
                  <strong>Status:</strong> {n.status}
                </p>
                <p className="text-sm text-[#3B0D14]">
                  <strong>Due Date:</strong> {n.due_date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
