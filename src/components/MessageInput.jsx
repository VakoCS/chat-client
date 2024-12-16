import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Smile, Image, Mic, Send, X } from "lucide-react";
import { uploadFile } from "../services/storage";

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSendMessage = (content, type = "text") => {
    if (content) {
      onSendMessage(content, type);
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadFile(file, "image");
        handleSendMessage(url, "image");
      } catch (error) {
        console.error("Error al subir imagen:", error);
        alert("Error al subir la imagen");
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        try {
          const file = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });
          const url = await uploadFile(file, "audio");
          handleSendMessage(url, "audio");
        } catch (error) {
          console.error("Error al subir audio:", error);
          alert("Error al subir el audio");
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      alert("Error al acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const startTimer = () => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  return (
    <div className="p-4 bg-white border-t relative">
      <div className="flex items-center gap-2">
        {/* Emoji Picker */}
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

        {/* Subida de imágenes */}
        <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <Image className="h-6 w-6 text-gray-500" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>

        {/* Input de mensaje */}
        {!isRecording && (
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(message, "text");
              }
            }}
            placeholder="Escribe un mensaje"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        )}

        {/* Grabación de audio */}
        {isRecording ? (
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
            <div className="animate-pulse">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <span className="text-sm text-gray-600">{recordingTime}s</span>
            <button
              onClick={stopRecording}
              className="ml-auto text-red-500 hover:text-red-600 p-1 hover:bg-red-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <Mic className="h-6 w-6 text-gray-500" />
          </button>
        )}

        {/* Botón enviar (solo visible cuando no está grabando) */}
        {!isRecording && (
          <button
            onClick={() => handleSendMessage(message, "text")}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;