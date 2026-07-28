import { useState, useEffect, useCallback } from "react";
import { useAudioPlayer } from "./useAudioPlayer";
import { questionVoiceService } from "../services/questionVoice.service";
import toast from "react-hot-toast";

export const VOICE_STATES = {
  IDLE: "IDLE",
  GENERATING: "GENERATING",
  READY: "READY",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  ERROR: "ERROR",
};

export const useQuestionVoice = (currentQuestion, sessionId, onPlaybackComplete, isVoiceDisabled = false) => {
  const [voiceState, setVoiceState] = useState(VOICE_STATES.IDLE);
  
  const {
    play: audioPlay,
    pause: audioPause,
    stop: audioStop,
    replay: audioReplay,
    clear: audioClear,
    load,
    isPlaying,
    audioRef
  } = useAudioPlayer({
    onLoaded: () => {
      if (isVoiceDisabled) {
        setVoiceState(VOICE_STATES.READY);
        return; // don't auto-play if disabled
      }
      
      // Auto-play when ready
      try {
        const playPromise = audioPlay();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Browser blocked autoplay:", error);
            // Autoplay fallback: degrade to READY state, show play button
            setVoiceState(VOICE_STATES.READY);
          });
        }
      } catch (error) {
        console.warn("Browser blocked autoplay:", error);
        setVoiceState(VOICE_STATES.READY);
      }
    },
    onPlay: () => {
      setVoiceState(VOICE_STATES.PLAYING);
      // Analytics reserved: "Question Played"
    },
    onPause: () => {
      setVoiceState(VOICE_STATES.PAUSED);
    },
    onEnded: () => {
      setVoiceState(VOICE_STATES.READY);
      // Analytics reserved: "Playback Completed"
      if (onPlaybackComplete) {
        onPlaybackComplete();
      }
    },
    onError: (e) => {
      console.error("Playback error:", e);
      setVoiceState(VOICE_STATES.ERROR);
      toast.error("Failed to play question audio.");
    }
  });

  // Force stop if voice becomes disabled (e.g., user clicks Next or Submit)
  useEffect(() => {
    if (isVoiceDisabled) {
      audioClear();
      setVoiceState(prev => (prev !== VOICE_STATES.IDLE ? VOICE_STATES.IDLE : prev));
    }
  }, [isVoiceDisabled, audioClear]);

  const questionKey = currentQuestion ? (currentQuestion.id || currentQuestion.question) : null;

  // Effect to load and play new question
  useEffect(() => {
    let isMounted = true;

    const loadQuestionAudio = async () => {
      if (!questionKey || !sessionId || isVoiceDisabled) return;
      
      // Always Stop and Clear Previous Playback
      audioClear();
      setVoiceState(VOICE_STATES.GENERATING);

      try {
        const blob = await questionVoiceService.getQuestionAudio(currentQuestion, sessionId);
        if (isMounted) {
          load(blob);
        }
      } catch (error) {
        if (isMounted) {
          setVoiceState(VOICE_STATES.ERROR);
          // Graceful Fallback: do not interrupt interview, just log error.
        }
      }
    };

    loadQuestionAudio();

    return () => {
      isMounted = false;
      audioClear();
    };
  }, [questionKey, sessionId, isVoiceDisabled]);

  // Derived controls
  const play = useCallback(() => {
    if (voiceState === VOICE_STATES.READY || voiceState === VOICE_STATES.PAUSED) {
      audioPlay();
    }
  }, [voiceState, audioPlay]);

  const pause = useCallback(() => {
    if (voiceState === VOICE_STATES.PLAYING) {
      audioPause();
    }
  }, [voiceState, audioPause]);

  const stop = useCallback(() => {
    if (voiceState === VOICE_STATES.PLAYING || voiceState === VOICE_STATES.PAUSED) {
      audioStop();
      setVoiceState(VOICE_STATES.READY);
    }
  }, [voiceState, audioStop]);

  const replay = useCallback(() => {
    if (voiceState !== VOICE_STATES.GENERATING) {
      audioReplay();
      // Analytics reserved: "Question Replayed"
    }
  }, [voiceState, audioReplay]);

  return {
    voiceState,
    isPlaying,
    play,
    pause,
    stop,
    replay,
    audioRef
  };
};
