import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Smile, Image, Mic, Send, X, Check } from "lucide-react";
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

  const handleSendMessage = (content, type = "text", audioDuration = null) => {
    if (content) {
      onSendMessage(content, type, audioDuration);
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
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      alert("Error al acceder al micrófono");
    }
  };

  const stopRecording = async (send = false) => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const currentDuration = recordingTime;
    const stream = mediaRecorderRef.current.stream;

    if (!send) {
      stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
      audioChunksRef.current = [];
    } else {
      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          try {
            const file = new File([audioBlob], `audio-${Date.now()}.webm`, {
              type: "audio/webm",
            });

            const url = await uploadFile(file, "audio");
            if (url) {
              handleSendMessage(url, "audio", currentDuration);
            }
          } catch (error) {
            console.error("Error al subir audio:", error);
            alert("Error al subir el audio");
          }
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
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
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-50 shadow-sm">
        <div className="relative">
          <button
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 hover:bg-white rounded-full transition-all duration-200 text-gray-500 hover:text-indigo-600 hover:shadow-sm"
            type="button"
          >
            <Smile className="h-6 w-6" />
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 z-50 shadow-xl rounded-lg"
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

        <label className="p-2.5 hover:bg-white rounded-full transition-all duration-200 text-gray-500 hover:text-indigo-600 hover:shadow-sm cursor-pointer relative group">
          <Image className="h-6 w-6" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Enviar imagen
          </span>
        </label>

        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
            <div className="flex items-center gap-2">
              <div className="relative w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-3 h-3 bg-red-500" />
              </div>
              <span className="text-sm font-medium text-red-600">
                {Math.floor(recordingTime / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(recordingTime % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => stopRecording(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={() => stopRecording(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 bg-white rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium"
              >
                <Check className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </div>
        ) : (
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
            className="flex-1 px-4 py-2.5 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow duration-200"
          />
        )}

        {!isRecording && !message.trim() ? (
          <button
            onClick={startRecording}
            className="p-2.5 hover:bg-white rounded-full transition-all duration-200 text-gray-500 hover:text-indigo-600 hover:shadow-sm relative group"
            type="button"
          >
            <Mic className="h-6 w-6" />
            <span className="absolute -top-10 right-0 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Grabar audio
            </span>
          </button>
        ) : (
          <button
            onClick={() => handleSendMessage(message, "text")}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              message.trim()
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "text-gray-400 bg-gray-100"
            }`}
            disabled={!message.trim()}
          >
            <Send className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
