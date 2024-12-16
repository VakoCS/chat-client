import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessages, getChats } from "../services/api";
import { socket } from "../services/socket";
import MessageInput from "./MessageInput";
import Message from "./Message";

const ChatWindow = () => {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChatData = async () => {
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

        const { data: messages } = await getMessages(chatId);
        setMessages(messages);
      } catch (error) {
        console.error("Error al cargar datos del chat:", error);
      }
    };

    if (chatId) {
      loadChatData();
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket.connected) {
      const token = localStorage.getItem("token");
      socket.auth = { token };
      socket.connect();
    }

    if (chatId) {
      socket.emit("join-chat", chatId);
    }

    const handleConnect = () => {
      console.log("Socket conectado:", socket.id);
      if (chatId) {
        socket.emit("join-chat", chatId);
      }
    };

    socket.on("connect", handleConnect);

    return () => {
      if (chatId) {
        socket.emit("leave-chat", chatId);
      }
      socket.off("connect", handleConnect);
    };
  }, [chatId]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.chatId === parseInt(chatId, 10)) {
        setMessages((prev) => {
          const messageExists = prev.some(
            (msg) =>
              msg.id === message.id ||
              (msg.id.toString().startsWith("temp-") &&
                msg.content === message.content)
          );

          if (messageExists) {
            return prev.map((msg) =>
              msg.id.toString().startsWith("temp-") &&
              msg.content === message.content
                ? message
                : msg
            );
          }

          return [...prev, message];
        });
      }
    };

    const handleMessageError = (error) => {
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
        alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-error", handleMessageError);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (
    messageContent,
    type = "text",
    audioDuration = null
  ) => {
    if (!messageContent) return;

    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        type: type,
        chatId: parseInt(chatId, 10),
        sender: {
          username: localStorage.getItem("username"),
          id: parseInt(localStorage.getItem("userId"), 10),
        },
        pending: true,
        createdAt: new Date().toISOString(),
        ...(type === "audio" ? { audioDuration } : {}),
      };

      setMessages((prev) => [...prev, tempMessage]);

      socket.emit("send-message", {
        content: messageContent,
        type: type,
        chatId: parseInt(chatId, 10),
        senderId: parseInt(localStorage.getItem("userId"), 10),
        ...(type === "audio" ? { audioDuration } : {}),
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setMessages((prev) =>
        prev.filter((msg) => !msg.id.toString().startsWith("temp-"))
      );
      alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              isOwn={
                msg.sender?.id === parseInt(localStorage.getItem("userId"), 10)
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
