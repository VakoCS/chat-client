import AudioMessage from "./AudioMessage";

const Message = ({ message, isOwn }) => {
  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative">
            <img
              src={message.content}
              alt="Imagen enviada"
              className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(message.content, "_blank")}
            />
            <span className="text-xs text-gray-500 absolute bottom-1 right-2">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      case "audio":
        return (
          <div className="space-y-2 min-w-[250px]">
            <AudioMessage
              src={message.content}
              duration={message.audioDuration}
            />
            <span className="text-xs text-gray-500 block text-right">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      default:
        return (
          <div className="space-y-1">
            <p className="text-base text-gray-800 whitespace-pre-wrap">
              {message.content}
            </p>
            <span className="text-xs text-gray-500 block text-right">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
    }
  };

  return (
    <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] p-3 rounded-lg
          ${isOwn ? "bg-indigo-100" : "bg-white border"} 
          ${message.pending ? "opacity-70" : ""}`}
      >
        <p className="text-sm font-medium text-gray-600 mb-2">
          {message.sender?.username || "Usuario desconocido"}
        </p>
        {renderContent()}
      </div>
    </div>
  );
};

export default Message;
