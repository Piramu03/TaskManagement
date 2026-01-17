import { useEffect, useState } from "react";
import API from "../api";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import ActivityTimeline from "../components/ActivityTimeline";
import Navbar from "../components/Navbar";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showActivity, setShowActivity] = useState(null);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadUser = async () => {
    try {
      const res = await API.get("/auth/me", authHeader);
      setUser(res.data);
      if (res.data.role === "admin") loadUsers();
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const loadUsers = async () => {
    try {
      const res = await API.get("/auth/users", authHeader);
      setUsers(res.data);
    } catch {}
  };

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

  useEffect(() => {
    loadUser();
    loadTasks();
  }, []);

  const createTask = async (payload) => {
    try {
      await API.post("/tasks", payload, authHeader);
      setShowCreate(false);
      loadTasks();
    } catch {
      alert("Create failed");
    }
  };

  const startEdit = (task) => setEditing(task);

  const saveEdit = async (payload) => {
    try {
      await API.put(`/tasks/${editing.id}`, payload, authHeader);
      setEditing(null);
      loadTasks();
    } catch {
      alert("Update failed");
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${task.id}`, authHeader);
      loadTasks();
    } catch {
      alert("Delete failed");
    }
  };

  const changeStatus = async (task, newStatus) => {
    if (newStatus === "view_activity") {
      setShowActivity(task);
      return;
    }

    try {
      await API.put(`/tasks/${task.id}`, { status: newStatus }, authHeader);
      loadTasks();
    } catch {}
  };

  const pending = tasks.filter((t) => t.status === "pending");
  const inprogress = tasks.filter((t) => t.status === "in_progress");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-[#E8D8C4] p-6">
      <Navbar />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2A070C]">
          Task Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#561C24] hover:bg-[#6D2932]
                       text-white px-4 py-2 rounded-lg shadow"
          >
            + Create Task
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-[#F6EEE4] border border-[#6D2932]
                       text-[#561C24] px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* BOARD */}
      {loading ? (
        <div className="text-center text-[#2A070C]">
          Loading tasks…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PENDING */}
          <div className="bg-[#F6EEE4] rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#2A070C] mb-4">Pending</h3>
            {pending.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={startEdit}
                onDelete={deleteTask}
                onStatusChange={changeStatus}
              />
            ))}
          </div>

          {/* IN PROGRESS */}
          <div className="bg-[#F6EEE4] rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#2A070C] mb-4">In Progress</h3>
            {inprogress.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={startEdit}
                onDelete={deleteTask}
                onStatusChange={changeStatus}
              />
            ))}
          </div>

          {/* COMPLETED */}
          <div className="bg-[#F6EEE4] rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#2A070C] mb-4">Completed</h3>
            {completed.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={startEdit}
                onDelete={deleteTask}
                onStatusChange={changeStatus}
              />
            ))}
          </div>

        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center"
          onClick={() => setShowCreate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F6EEE4] rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <TaskForm
              onCancel={() => setShowCreate(false)}
              onSubmit={createTask}
              isAdmin={user?.role === "admin"}
              users={users}
            />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center"
          onClick={() => setEditing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F6EEE4] rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <TaskForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={saveEdit}
              isAdmin={user?.role === "admin"}
              users={users}
            />
          </div>
        </div>
      )}

      {/* ACTIVITY */}
      {showActivity && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
          <ActivityTimeline
            taskId={showActivity.id}
            onClose={() => setShowActivity(null)}
          />
        </div>
      )}

    </div>
  );
}
