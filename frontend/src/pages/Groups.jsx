import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [me, setMe] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // ================= LOAD ALL DATA =================
  useEffect(() => {
    loadGroups();

    loadMe();
  }, []);

  // ================= LOAD GROUPS =================
  const loadGroups = async () => {
    const res = await API.get("/groups/", authHeader);
    const data = res.data || [];
    setGroups(data);

    // Load members for each group
    data.forEach((g) => loadGroupMembers(g.id));
  };

  // ================= LOAD USERS (FOR CHECKBOX) =================
  const loadUsers = async () => {
    const res = await API.get("/auth/users", authHeader);
    setUsers(res.data || []);
  };

  // ================= LOAD CURRENT USER =================
  const loadMe = async () => {
    const res = await API.get("/auth/me", authHeader);
    setMe(res.data);

    if (res.data.role === "admin") {
      loadUsers();
    }
  };

  // ================= LOAD GROUP MEMBERS =================
  const loadGroupMembers = async (groupId) => {
    try {
      const res = await API.get(
        `/chat/group/${groupId}/members`,
        authHeader
      );
      setGroupMembers((prev) => ({
        ...prev,
        [groupId]: res.data
      }));
    } catch {
      setGroupMembers((prev) => ({
        ...prev,
        [groupId]: []
      }));
    }
  };

  // ================= TOGGLE MEMBER (CREATE GROUP) =================
  const toggleMember = (userId) => {
    setMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // ================= CREATE GROUP =================
  const createGroup = async () => {
    if (!name || members.length === 0) {
      alert("Enter group name and select members");
      return;
    }

    const res = await API.post(
      "/groups/",
      { name, members },
      authHeader
    );

    setShowCreate(false);
    setName("");
    setMembers([]);

    loadGroups();
    navigate(`/chat/${res.data.id}`);
  };

  // ================= DELETE GROUP (ADMIN ONLY) =================
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await API.delete(`/groups/${groupId}`, authHeader);
      loadGroups();
    } catch {
      alert("Only admin can delete group");
    }
  };

  return (
    <div className="min-h-screen bg-[#E8D8C4]">
      <Navbar />

      <div className="p-6 max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#561C24]">Groups</h1>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#561C24] text-white px-4 py-2 rounded-lg"
          >
            + Create Group
          </button>
        </div>

        {/* GROUP LIST */}
        {groups.length === 0 ? (
          <p className="text-[#561C24]">No groups available</p>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="bg-[#F6EEE4] p-4 rounded-xl mb-3 hover:shadow flex justify-between items-start"
            >
              <div
                onClick={() => navigate(`/chat/${g.id}`)}
                className="cursor-pointer"
              >
                <div className="font-semibold text-[#561C24]">
                  {g.name}
                </div>

                {/* MEMBERS (FROM BACKEND) */}
                <div className="text-sm text-[#6D2932] mt-1">
                  Members:{" "}
                  {groupMembers[g.id]?.length > 0
                    ? groupMembers[g.id]
                        .map((m) => m.name)
                        .join(", ")
                    : "No members"}
                </div>
              </div>

              {/* ADMIN DELETE */}
              {me?.role === "admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(g.id);
                  }}
                  className="text-red-600 text-sm font-semibold"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="font-bold mb-4 text-[#561C24]">
              Create Group
            </h3>

            <input
              placeholder="Group name"
              className="w-full p-2 border rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="mb-4 max-h-40 overflow-y-auto border rounded p-2">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 mb-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={members.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                  />
                  {u.name}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                onClick={createGroup}
                className="bg-[#561C24] text-white px-3 py-1 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
