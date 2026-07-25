import { useEffect, useState } from "react";
import { Play, Pause, Square, RotateCcw, Loader2 } from "lucide-react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import toast from "react-hot-toast";

export const VoicePlayer = ({ audioBlob, onLoaded, onPlay, onPause, onEnded, onError }) => {
  const {
    play,
    pause,
    stop,
    replay,
    load,
    isPlaying,
    isLoading
  } = useAudioPlayer({
    onLoaded,
    onPlay,
    onPause,
    onEnded,
    onError: (e) => {
      console.error("Audio playback error:", e);
      toast.error("Failed to play audio.");
      if (onError) onError(e);
    }
  });

  // Automatically load the blob when it's provided or changes
  useEffect(() => {
    if (audioBlob) {
      load(audioBlob);
    }
  }, [audioBlob, load]);

  if (!audioBlob) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-dark-700 rounded-xl border border-dark-600 shadow-md">
      {isLoading ? (
        <div className="flex items-center justify-center p-3 rounded-full bg-dark-600 text-primary-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="flex gap-2">
          {isPlaying ? (
            <button
              onClick={pause}
              className="p-3 bg-primary-600 hover:bg-primary-500 rounded-full text-white transition-colors"
              aria-label="Pause"
            >
              <Pause className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={play}
              className="p-3 bg-primary-600 hover:bg-primary-500 rounded-full text-white transition-colors"
              aria-label="Play"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
          )}

          <button
            onClick={stop}
            className="p-3 bg-dark-600 hover:bg-dark-500 rounded-full text-dark-200 transition-colors"
            aria-label="Stop"
            disabled={!isPlaying}
          >
            <Square className="w-5 h-5 fill-current text-dark-200" />
          </button>

          <button
            onClick={replay}
            className="p-3 bg-dark-600 hover:bg-dark-500 rounded-full text-dark-200 transition-colors"
            aria-label="Replay"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="text-sm text-dark-300 ml-2">
        {isPlaying ? "Playing audio..." : "Ready"}
      </div>
    </div>
  );
};
