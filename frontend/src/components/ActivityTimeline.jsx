import { useEffect, useState } from "react";
import API from "../api";

export default function ActivityTimeline({ taskId, onClose }) {
  const [logs, setLogs] = useState([]);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line
  }, []);

  const loadLogs = async () => {
    try {
      const res = await API.get(`/activity/${taskId}`, authHeader);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load activity logs", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <button onClick={onClose} className="text-red-600 font-bold">✕</button>
      </div>

      {logs.length === 0 ? (
        <div className="text-gray-500 text-sm">No activity yet</div>
      ) : (
        <ul className="space-y-3 text-sm">
          {logs.map((log, index) => (
            <li key={index} className="border-l-2 pl-3 border-blue-400">
              <div>{log.action}</div>
              <div className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
