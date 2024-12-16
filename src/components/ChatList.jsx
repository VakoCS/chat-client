import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getChats } from "../services/api";
import { socket } from "../services/socket";
import { formatMessageDate } from "../utils/formatMessageDate";

const ChatList = ({ chats: propChats, setChats: setParentChats }) => {
  const [localChats, setLocalChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState(new Set());
  const { id: currentChatId } = useParams();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await getChats();
        setLocalChats(data);
        if (setParentChats) {
          setParentChats(data);
        }
      } catch (error) {
        console.error("Error al cargar los chats:", error);
      }
    };
    fetchChats();
  }, [setParentChats]);

  // Escuchar nuevos mensajes
  useEffect(() => {
    const handleNewMessage = (message) => {
      const isCurrentChat = message.chatId === parseInt(currentChatId, 10);
      const isSender =
        message.senderId === parseInt(localStorage.getItem("userId"), 10);

      // Actualizar la lista de chats con el nuevo mensaje
      setLocalChats((prev) =>
        prev.map((chat) => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
            };
          }
          return chat;
        })
      );

      // Marcar como no leído si no es el chat actual y no es el remitente
      if (!isCurrentChat && !isSender) {
        setUnreadChats((prev) => new Set(prev).add(message.chatId));
      }
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [currentChatId]);

  // Limpiar no leídos cuando se cambia de chat
  useEffect(() => {
    if (currentChatId) {
      setUnreadChats((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parseInt(currentChatId, 10));
        return newSet;
      });
    }
  }, [currentChatId]);

  const displayChats = propChats?.length > 0 ? propChats : localChats;

  const getOtherMember = (chat) => {
    const currentUserId = parseInt(localStorage.getItem("userId"), 10);
    return (
      chat.members.find((member) => member.id !== currentUserId) ||
      chat.members[0]
    );
  };

  return (
    <div className="overflow-y-auto">
      <ul className="space-y-0.5">
        {displayChats.map((chat) => {
          const otherMember = getOtherMember(chat);
          const isUnread = unreadChats.has(chat.id);
          const isSelected = currentChatId === chat.id.toString();

          return (
            <li key={chat.id}>
              <Link
                to={`/chat/${chat.id}`}
                className={`block px-3 py-3 transition-all duration-200 relative
                  ${
                    isSelected
                      ? "bg-indigo-50 border-r-4 border-indigo-500"
                      : "hover:bg-gray-50"
                  }
                  ${
                    isUnread &&
                    !isSelected &&
                    "bg-gradient-to-r from-blue-50 to-transparent"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    {otherMember?.avatarUrl ? (
                      <img
                        src={otherMember.avatarUrl}
                        alt={otherMember.username}
                        className={`w-12 h-12 rounded-full object-cover transition-shadow
                          ${isUnread ? "ring-2 ring-blue-400" : ""}
                        `}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${
                          isUnread
                            ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-400"
                            : "bg-gradient-to-br from-gray-100 to-gray-200"
                        }`}
                      >
                        <span
                          className={`text-lg font-medium
                          ${isUnread ? "text-blue-700" : "text-gray-600"}
                        `}
                        >
                          {otherMember?.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                    )}
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p
                        className={`text-sm font-medium truncate
                        ${isUnread ? "text-blue-800" : "text-gray-900"}
                      `}
                      >
                        {otherMember?.username || "Usuario desconocido"}
                      </p>
                      {chat.lastMessage && (
                        <span
                          className={`text-xs ${
                            isUnread ? "text-blue-600" : "text-gray-400"
                          }`}
                        >
                          {formatMessageDate(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage ? (
                      <div className="flex items-center space-x-1 mt-0.5">
                        {chat.lastMessage.senderId ===
                          parseInt(localStorage.getItem("userId"), 10) && (
                          <span className="text-xs text-gray-400 flex items-center">
                            <svg
                              className="w-3 h-3 mr-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Tú:
                          </span>
                        )}
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "text-blue-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {chat.lastMessage.type === "image" && "📸 Foto"}
                          {chat.lastMessage.type === "audio" &&
                            "🎤 Mensaje de voz"}
                          {chat.lastMessage.type === "text" &&
                            chat.lastMessage.content}
                        </p>
                      </div>
                    ) : (
                      <p
                        className={`text-sm truncate ${
                          isUnread
                            ? "text-blue-600 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {chat.lastMessage?.displayContent ||
                          "No hay mensajes aún"}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {displayChats.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No hay chats disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Usa el buscador para iniciar una nueva conversación
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
