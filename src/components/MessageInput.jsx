import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-4 bg-white border-t relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <Smile className="h-6 w-6 text-gray-500" />
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 z-50 shadow-xl"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={350}
                height={400}
                searchPlaceholder="Buscar emoji..."
                lazyLoadEmojis={true}
                skinTonesDisabled
                previewConfig={{
                  showPreview: false,
                }}
              />
            </div>
          )}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
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
  );
};

export default MessageInput;
