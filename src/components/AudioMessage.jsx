import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const AudioMessage = ({ src, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleLoadedMetadata = () => {
      if (!duration && audioElement) {
        setAudioDuration(audioElement.duration);
      }
    };

    const handleError = (e) => {
      console.error("Error de audio completo:", {
        src,
        error: audioElement.error,
        errorCode: audioElement.error?.code,
        errorMessage: audioElement.error?.message,
      });
    };

    const handleTimeUpdate = () => {
      if (audioElement) {
        setCurrentTime(audioElement.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("error", handleError);

    return () => {
      audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("error", handleError);
    };
  }, [duration, src]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch((error) => {
          console.error("Error al reproducir audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const seekTime = (e.target.value / 100) * audioDuration;
      audioElement.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  if (!src) {
    return (
      <div className="text-red-500 text-sm">
        No se puede reproducir el audio (URL no válida)
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3 shadow-sm">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error("Audio element error:", e);
        }}
      />
      <button
        onClick={togglePlay}
        className="p-2 bg-indigo-500 text-white rounded-full 
                  hover:bg-indigo-600 transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / audioDuration) * 100 || 0}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-300 rounded-full 
                    appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-indigo-500
                    [&::-webkit-slider-thumb]:rounded-full"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      <button
        onClick={toggleMute}
        className="p-1 text-gray-600 hover:text-indigo-600 transition-colors"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};

export default AudioMessage;
