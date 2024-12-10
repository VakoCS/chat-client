import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition-colors">
          <span className="text-indigo-600 font-medium">
            {username?.charAt(0).toUpperCase()}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{username}</p>
          </div>
          <button
            onClick={handleProfile}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User size={16} className="mr-2" />
            Perfil
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} className="mr-2" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
