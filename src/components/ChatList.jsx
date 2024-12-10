import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getChats } from "../services/api";
import { socket } from "../services/socket";

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
    <div className="overflow-y-auto h-[calc(100vh-8rem)]">
      <ul className="space-y-1">
        {displayChats.map((chat) => {
          const otherMember = getOtherMember(chat);
          const isUnread = unreadChats.has(chat.id);

          return (
            <li key={chat.id}>
              <Link
                to={`/chat/${chat.id}`}
                className={`block px-4 py-3 transition-colors duration-150 relative
                  ${currentChatId === chat.id.toString() ? "bg-indigo-50" : ""}
                  ${
                    isUnread
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }
                `}
              >
                {isUnread && (
                  <span className="absolute right-3 top-3 w-2 h-2 bg-blue-500 rounded-full" />
                )}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {otherMember?.avatarUrl ? (
                      <img
                        src={otherMember.avatarUrl}
                        alt={otherMember.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-lg">
                          {otherMember?.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p
                        className={`text-sm font-medium truncate ${
                          isUnread ? "text-blue-800" : "text-gray-900"
                        }`}
                      >
                        {otherMember?.username || "Usuario desconocido"}
                      </p>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(
                            chat.lastMessage.createdAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage ? (
                      <div className="flex items-center space-x-1">
                        {chat.lastMessage.senderId ===
                          parseInt(localStorage.getItem("userId"), 10) && (
                          <span className="text-xs text-gray-400">Tú:</span>
                        )}
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "text-blue-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {chat.lastMessage.content}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No hay mensajes aún
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
        <div className="text-center py-8 px-4">
          <p className="text-gray-500">No hay chats disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Usa el buscador para iniciar una nueva conversación
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
