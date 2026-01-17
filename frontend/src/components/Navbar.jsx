import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center
                    bg-[#F6EEE4] border-b border-[#C7B7A3]
                    px-6 py-4">

      {/* Logo */}
      
      {/* Navigation Links */}
      <div className="flex gap-6 text-sm font-medium text-[#561C24]">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>

        <Link to="/productivity" className="hover:underline">
          Productivity
        </Link>

        <Link to="/notifications" className="hover:underline">
          Notifications
        </Link>

        <Link to="/groups" className="hover:underline">
          Groups
        </Link>

        

        <Link to="/profile" className="hover:underline">
          Profile
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="text-sm px-4 py-2 rounded-lg
                   bg-[#561C24] text-white
                   hover:bg-[#6D2932]"
      >
        Logout
      </button>
    </div>
  );
}
