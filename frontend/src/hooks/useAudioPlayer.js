import { useState, useRef, useEffect, useCallback } from "react";

export const useAudioPlayer = ({
  onLoaded,
  onPlay,
  onPause,
  onEnded,
  onError,
  // Reserved for future extensions:
  playbackRate = 1.0,
  volume = 1.0,
  selectedVoice = null
} = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  
  // Store callbacks in a ref to prevent dependency cycles
  const callbacksRef = useRef({ onLoaded, onPlay, onPause, onEnded, onError });
  useEffect(() => {
    callbacksRef.current = { onLoaded, onPlay, onPause, onEnded, onError };
  });

  // Cleanup object URLs properly
  const cleanupUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Unmount cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cleanupUrl();
    };
  }, [cleanupUrl]);

  const load = useCallback((blob) => {
    setIsLoading(true);
    cleanupUrl();
    
    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      if (callbacksRef.current.onLoaded) callbacksRef.current.onLoaded();
    };

    audio.onplay = () => {
      setIsPlaying(true);
      if (callbacksRef.current.onPlay) callbacksRef.current.onPlay();
    };

    audio.onpause = () => {
      setIsPlaying(false);
      if (callbacksRef.current.onPause) callbacksRef.current.onPause();
    };

    audio.onended = () => {
      setIsPlaying(false);
      if (callbacksRef.current.onEnded) callbacksRef.current.onEnded();
    };

    audio.onerror = (e) => {
      setIsLoading(false);
      setIsPlaying(false);
      if (callbacksRef.current.onError) callbacksRef.current.onError(e);
    };

    audio.src = url;
    audio.load();

  }, [cleanupUrl]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        if (onError) onError(e);
      });
    }
  }, [onError]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const replay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        if (onError) onError(e);
      });
    }
  }, [onError]);

  const clear = useCallback(() => {
    setIsLoading(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    cleanupUrl();
  }, [cleanupUrl]);

  return {
    play,
    pause,
    stop,
    replay,
    clear,
    load,
    isPlaying,
    isLoading
  };
};
