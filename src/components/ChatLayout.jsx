import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import UserSearch from "./UserSearch";
import { getChats } from "../services/api";
import UserProfileMenu from "./UserProfileMenu";
import { socket } from "../services/socket";

const ChatLayout = () => {
  const { id } = useParams();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await getChats();
        setChats(data);
      } catch (error) {
        console.error("Error al cargar los chats:", error);
      }
    };
    fetchChats();

    // Escuchar nuevos mensajes para actualizar la lista de chats
    socket.on("new-message", (message) => {
      setChats((prev) =>
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
    });

    return () => {
      socket.off("new-message");
    };
  }, []);

  const handleCreateChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
            <UserProfileMenu />
          </div>
        </div>
        <UserSearch onCreateChat={handleCreateChat} />
        <ChatList chats={chats} setChats={setChats} />
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {!id ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-medium text-gray-600">
                Seleccione un chat para comenzar
              </h2>
              <p className="text-gray-400 mt-2">
                Escoge una conversación de la lista
              </p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
