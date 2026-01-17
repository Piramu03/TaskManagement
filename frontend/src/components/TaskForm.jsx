import { useState, useEffect } from "react";

export default function TaskForm({
  initial = null,
  onCancel,
  onSubmit,
  isAdmin = false,
  users = []
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [category, setCategory] = useState("general");
  const [due_date, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [assignedTo, setAssignedTo] = useState("");

  // ✅ ONLY run when editing
  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setDescription(initial.description || "");
      setPriority(initial.priority || "low");
      setCategory(initial.category || "general");
      setDueDate(initial.due_date || "");
      setStatus(initial.status || "pending");
      setAssignedTo(initial.assigned_to ?? "");
    }
  }, [initial?.id]);

  const submit = () => {
    if (!title.trim()) return alert("Title is required");

    const payload = {
      title,
      description,
      priority,
      category,
      due_date,
      status
    };

    if (isAdmin && assignedTo) {
      payload.assigned_to = Number(assignedTo);
    }

    onSubmit(payload);
  };

  return (
    <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[var(--secondary)]">
      
      <h3 className="text-xl font-semibold text-[var(--primary)] mb-4">
        {initial ? "Edit Task" : "Create Task"}
      </h3>

      {/* Title */}
      <input
        className="w-full p-3 mb-3 rounded-lg border border-[var(--secondary)] bg-white
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Description */}
      <textarea
        className="w-full p-3 mb-3 rounded-lg border border-[var(--secondary)] bg-white
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        placeholder="Task description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Priority + Status */}
      <div className="flex gap-3 mb-3">
        <select
          className="flex-1 p-3 rounded-lg border border-[var(--secondary)] bg-white
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <select
          className="flex-1 p-3 rounded-lg border border-[var(--secondary)] bg-white
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Due Date */}
      <input
        type="date"
        className="w-full p-3 mb-3 rounded-lg border border-[var(--secondary)] bg-white
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        value={due_date}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* Category */}
      <input
        className="w-full p-3 mb-3 rounded-lg border border-[var(--secondary)] bg-white
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      {/* Admin: Assign user */}
      {isAdmin && (
        <select
          className="w-full p-3 mb-4 rounded-lg border border-[var(--secondary)] bg-white
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">Assign to user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--secondary)]
                     text-[var(--darkText)] hover:bg-[var(--base)] transition"
        >
          Cancel
        </button>

        <button
          onClick={submit}
          className="px-4 py-2 rounded-lg bg-[var(--primary)]
                     text-white hover:bg-[var(--secondary)] transition"
        >
          {initial ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </div>
  );
}
