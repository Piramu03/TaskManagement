import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {

  const statusLabel = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  }[task.status || "pending"];

  // Priority badge – higher contrast
  const priorityStyle = {
    low: "bg-[#E8D8C4] text-[#2A070C]",
    medium: "bg-[#D6C3AE] text-[#2A070C]",
    high: "bg-[#6D2932] text-white",
  }[task.priority || "low"];

  // Accent bar
  const accentBar = {
    pending: "border-[#C7B7A3]",
    in_progress: "border-[#6D2932]",
    completed: "border-[#561C24]",
  }[task.status || "pending"];

  return (
    <div
      className={`bg-[#F6EEE4] border-l-4 ${accentBar}
                  rounded-xl p-4 mb-4
                  shadow-sm hover:shadow-md transition`}
    >
      <div className="flex justify-between items-start gap-4">

        {/* LEFT */}
        <div className="flex-1">
          {/* TITLE – darker */}
          <h4 className="font-bold text-[#2A070C] text-base">
            {task.title}
          </h4>

          {/* DESCRIPTION – readable */}
          <p className="text-sm text-[#3B0D14] mt-1 leading-relaxed">
            {task.description}
          </p>

          {/* BADGES */}
          <div className="flex gap-2 mt-3 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-semibold ${priorityStyle}`}
            >
              {task.priority}
            </span>

            <span className="px-3 py-1 rounded-full bg-white text-[#2A070C] font-semibold">
              {task.category}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end gap-2">
          {/* Status label – darker */}
          <span className="text-xs font-semibold text-[#561C24]">
            {statusLabel}
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-md text-[#561C24]
                         hover:bg-[#E8D8C4] transition"
            >
              <FiEdit size={14} />
            </button>

            <button
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-md text-[#561C24]
                         hover:bg-[#E8D8C4] transition"
            >
              <FiTrash2 size={14} />
            </button>
          </div>

          <button
            onClick={() => onStatusChange(task, "view_activity")}
            className="text-xs font-semibold text-[#2A070C] underline hover:opacity-80"
          >
            Activity
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#2A070C]">
        <span>
          Due: <span className="font-semibold">{task.due_date || "—"}</span>
        </span>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          className="px-2 py-1 rounded-lg bg-white
                     border border-[#C7B7A3]
                     text-[#2A070C] font-semibold text-xs
                     focus:outline-none"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
