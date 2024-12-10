import { useState, useEffect } from "react";
import { Search, MessageCircle, UserPlus } from "lucide-react";
import { searchUsers, createChat, getChats } from "../services/api";
import { useNavigate } from "react-router-dom";

const UserSearch = ({ onCreateChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingChats, setExistingChats] = useState({});
  const navigate = useNavigate();

  // Cargar chats existentes
  useEffect(() => {
    const loadExistingChats = async () => {
      try {
        const { data } = await getChats();
        const chatMap = {};
        data.forEach((chat) => {
          chat.members.forEach((member) => {
            if (member.id !== parseInt(localStorage.getItem("userId"), 10)) {
              chatMap[member.id] = chat.id;
            }
          });
        });
        setExistingChats(chatMap);
      } catch (error) {
        console.error("Error cargando chats:", error);
      }
    };
    loadExistingChats();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await searchUsers(query);
      const currentUserId = parseInt(localStorage.getItem("userId"), 10);
      setUsers(data.filter((user) => user.id !== currentUserId));
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setError("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleCreateChat = async (userId) => {
    try {
      const currentUserId = parseInt(localStorage.getItem("userId"), 10);
      const { data } = await createChat([currentUserId, userId]);

      onCreateChat?.(data);
      setSearchQuery("");
      setUsers([]);
      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error("Error al crear el chat:", error);
      if (error.response?.data?.existingChatId) {
        navigate(`/chat/${error.response.data.existingChatId}`);
        return;
      }
      setError(error.response?.data?.error || "Error al crear el chat");
    }
  };

  const handleUserAction = (user) => {
    const existingChatId = existingChats[user.id];
    if (existingChatId) {
      navigate(`/chat/${existingChatId}`);
    } else {
      handleCreateChat(user.id);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {loading && (
        <div className="mt-2 text-center text-gray-500">
          <div className="animate-pulse">Buscando usuarios...</div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-center text-red-500 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {users.length > 0 && (
        <div className="mt-2 space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                      <span className="text-lg font-medium text-indigo-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.username}</h3>
                </div>
              </div>
              <button
                onClick={() => handleUserAction(user)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors duration-150 ${
                  existingChats[user.id]
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {existingChats[user.id] ? (
                  <>
                    <MessageCircle size={18} />
                    <span>Ver chat</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Iniciar chat</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !loading && users.length === 0 && (
        <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No se encontraron usuarios</p>
          <p className="text-sm text-gray-400 mt-1">
            Intenta con un nombre de usuario diferente
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
