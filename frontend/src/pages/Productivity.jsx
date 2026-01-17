import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function Productivity() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tasks", authHeader);
      setTasks(res.data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inprogress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  const completionRate = total
    ? Math.round((completed / total) * 100)
    : 0;

  const high = tasks.filter(t => t.priority === "high").length;
  const medium = tasks.filter(t => t.priority === "medium").length;
  const low = tasks.filter(t => t.priority === "low").length;

  return (
    <div className="min-h-screen bg-[#E8D8C4]">

      <Navbar />

      <div className="p-6">

        <h1 className="text-3xl font-bold text-[#561C24] mb-6">
          Productivity Overview
        </h1>

        {loading ? (
          <div className="text-[#561C24]">Loading data…</div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

              <StatCard label="Total Tasks" value={total} />
              <StatCard label="Completed" value={completed} />
              <StatCard label="In Progress" value={inprogress} />
              <StatCard label="Pending" value={pending} />

            </div>

            {/* COMPLETION RATE */}
            <div className="bg-[#F6EEE4] rounded-xl p-6 mb-8 shadow">
              <h3 className="font-semibold text-[#561C24] mb-2">
                Completion Rate
              </h3>

              <div className="text-4xl font-bold text-[#6D2932]">
                {completionRate}%
              </div>

              <p className="text-sm text-[#561C24] mt-1">
                Based on completed tasks
              </p>
            </div>

            {/* PRIORITY DISTRIBUTION */}
            <div className="bg-[#F6EEE4] rounded-xl p-6 shadow">
              <h3 className="font-semibold text-[#561C24] mb-4">
                Priority Distribution
              </h3>

              <div className="space-y-2 text-sm text-[#561C24]">
                <p>🔴 High Priority: <b>{high}</b></p>
                <p>🟡 Medium Priority: <b>{medium}</b></p>
                <p>🟢 Low Priority: <b>{low}</b></p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* SMALL STAT CARD COMPONENT */
function StatCard({ label, value }) {
  return (
    <div className="bg-[#F6EEE4] rounded-xl p-4 shadow text-center">
      <p className="text-sm text-[#561C24]">{label}</p>
      <p className="text-3xl font-bold text-[#6D2932]">{value}</p>
    </div>
  );
}
