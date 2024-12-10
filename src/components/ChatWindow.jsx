import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessages, getChats } from "../services/api";
import { socket } from "../services/socket";

const ChatWindow = () => {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Obtener la información del chat
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const { data: chats } = await getChats();
        const currentChat = chats.find(
          (chat) => chat.id === parseInt(chatId, 10)
        );
        if (currentChat) {
          const currentUserId = parseInt(localStorage.getItem("userId"), 10);
          const otherMember = currentChat.members.find(
            (member) => member.id !== currentUserId
          );
          setChatInfo(otherMember);
        }
      } catch (error) {
        console.error("Error al cargar la información del chat:", error);
      }
    };
    fetchChatInfo();
  }, [chatId]);

  // Inicializar conexión del socket
  // Conectar socket al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);
      // Al conectar, unirse a la sala de chat
      if (chatId) {
        socket.emit("join-chat", chatId);
      }
    });

    return () => {
      if (socket.connected) {
        if (chatId) {
          socket.emit("leave-chat", chatId);
        }
        socket.disconnect();
      }
    };
  }, []); // Solo al montar/desmontar

  // Cargar mensajes iniciales
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(chatId);
        setMessages(data);
      } catch (error) {
        console.error("Error al cargar los mensajes:", error);
      }
    };
    fetchMessages();
  }, [chatId]);

  // Manejar mensajes nuevos
  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log("Mensaje recibido:", message);
      console.log("ChatId actual:", chatId);
      console.log("ChatId del mensaje:", message.chatId);

      if (message.chatId === parseInt(chatId, 10)) {
        setMessages((prev) => {
          console.log("Actualizando mensajes...");
          // Verificar si ya existe un mensaje temporal con el mismo contenido
          const hasTempMessage = prev.some(
            (msg) =>
              msg.id.toString().startsWith("temp-") &&
              msg.content === message.content
          );

          if (hasTempMessage) {
            // Reemplazar el mensaje temporal con el real
            return prev.map((msg) =>
              msg.id.toString().startsWith("temp-") &&
              msg.content === message.content
                ? message
                : msg
            );
          }

          // Si no existe un mensaje temporal, agregar el nuevo mensaje
          return [...prev, message];
        });
      }
    };

    const handleMessageError = (error) => {
      console.error("Error en el mensaje:", error);
      if (error.content) {
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              !(
                msg.id.toString().startsWith("temp-") &&
                msg.content === error.content
              )
          )
        );
      }
      alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
    };

    console.log("Suscribiéndose a new-message");
    socket.on("new-message", handleNewMessage);
    socket.on("message-error", handleMessageError);

    return () => {
      console.log("Desuscribiéndose de new-message");
      socket.off("new-message", handleNewMessage);
      socket.off("message-error", handleMessageError);
    };
  }, [chatId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Crear mensaje temporal para UI optimista
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        chatId: parseInt(chatId, 10),
        sender: {
          username: localStorage.getItem("username"),
        },
        pending: true,
      };

      // Actualizar UI inmediatamente
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      // Enviar mensaje a través del socket
      socket.emit("send-message", {
        content: newMessage,
        chatId: parseInt(chatId, 10),
        senderId: parseInt(localStorage.getItem("userId"), 10),
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setMessages((prev) =>
        prev.filter((msg) => !msg.id.toString().startsWith("temp-"))
      );
      alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          {chatInfo && (
            <>
              <div className="flex-shrink-0">
                {chatInfo.avatarUrl ? (
                  <img
                    src={chatInfo.avatarUrl}
                    alt={chatInfo.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {chatInfo.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {chatInfo.username}
              </h2>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${
              msg.sender?.username === localStorage.getItem("username")
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender?.username === localStorage.getItem("username")
                  ? "bg-indigo-100"
                  : "bg-white border"
              } ${msg.pending ? "opacity-70" : ""}`}
            >
              <p className="text-sm font-medium text-gray-600">
                {msg.sender?.username || "Usuario desconocido"}
              </p>
              <p className="text-base text-gray-800 break-words">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
