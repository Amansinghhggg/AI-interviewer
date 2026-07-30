import React, { useEffect, useRef, useState, memo } from 'react';
import idleVideoDefault from '../../assets/avatar/idle.mp4';
import talkingVideoDefault from '../../assets/avatar/talking.mp4';
import stillImageDefault from '../../assets/avatar/still.jpg';
import './AvatarPlayer.css';

/**
 * Visual states supported by AvatarPlayer.
 */
export type AvatarMode = 'speaking' | 'listening' | 'thinking' | 'processing' | 'idle';

/**
 * Props for the AvatarPlayer component.
 */
export interface AvatarPlayerProps {
  /**
   * Indicates whether the AI interviewer is currently speaking.
   * Displays talking.mp4.
   */
  isSpeaking?: boolean;

  /**
   * Indicates whether the AI interviewer is currently thinking.
   * Displays still.jpg.
   */
  isThinking?: boolean;

  /**
   * Alias for isThinking.
   */
  isProcessing?: boolean;

  /**
   * Explicit mode override ('speaking' | 'listening' | 'thinking' | 'processing' | 'idle').
   */
  mode?: AvatarMode;

  /**
   * Optional additional CSS class names for container styling.
   */
  className?: string;

  /**
   * Optional custom URL or asset for idle video (listening / default state).
   */
  idleVideoSrc?: string;

  /**
   * Optional custom URL or asset for talking video (speech / audio on state).
   */
  talkingVideoSrc?: string;

  /**
   * Optional custom URL or asset for still image (thinking / processing state).
   */
  stillImageSrc?: string;

  /**
   * Optional aspect ratio string (e.g., '16 / 9', '1 / 1', '4 / 3').
   * Defaults to '16 / 9'.
   */
  aspectRatio?: string;

  /**
   * Optional toggle to display a status badge overlay.
   */
  showStatusBadge?: boolean;

  /**
   * Optional callback triggered when all media assets are ready.
   */
  onReady?: () => void;

  /**
   * Optional error handler for media loading failures.
   */
  onError?: (error: Error) => void;
}

/**
 * AvatarPlayer
 * 
 * High-performance AI Interview Avatar player supporting a 3-state flow:
 * 1. Talking (Audio ON) -> talking.mp4
 * 2. Listening / Idle   -> idle.mp4
 * 3. Thinking / Processing -> still.jpg
 * 
 * Uses 200ms ease-in-out opacity transitions across all layers without unmounting.
 */
export const AvatarPlayer: React.FC<AvatarPlayerProps> = memo(({
  isSpeaking = false,
  isThinking = false,
  isProcessing = false,
  mode,
  className = '',
  idleVideoSrc = idleVideoDefault,
  talkingVideoSrc = talkingVideoDefault,
  stillImageSrc = stillImageDefault,
  aspectRatio = '16 / 9',
  showStatusBadge = false,
  onReady,
  onError,
}) => {
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const talkingVideoRef = useRef<HTMLVideoElement>(null);

  // Readiness state management
  const [isIdleLoaded, setIsIdleLoaded] = useState<boolean>(false);
  const [isTalkingLoaded, setIsTalkingLoaded] = useState<boolean>(false);

  /**
   * Safe video playback helper to handle browser autoplay policies.
   */
  const playVideoSafely = (videoEl: HTMLVideoElement | null) => {
    if (videoEl) {
      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.playsInline = true;

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            onError?.(err instanceof Error ? err : new Error(String(err)));
          }
        });
      }
    }
  };

  // Mount effect: Start and loop both videos continuously in background
  useEffect(() => {
    playVideoSafely(idleVideoRef.current);
    playVideoSafely(talkingVideoRef.current);
  }, [idleVideoSrc, talkingVideoSrc]);

  const handleIdleCanPlay = () => setIsIdleLoaded(true);
  const handleTalkingCanPlay = () => setIsTalkingLoaded(true);

  useEffect(() => {
    if (isIdleLoaded && isTalkingLoaded && onReady) {
      onReady();
    }
  }, [isIdleLoaded, isTalkingLoaded, onReady]);

  /**
   * Calculate effective target state based on mode or boolean flags.
   */
  let targetState: 'speaking' | 'thinking' | 'idle' = 'idle';

  if (mode) {
    if (mode === 'speaking') {
      targetState = 'speaking';
    } else if (mode === 'thinking' || mode === 'processing') {
      targetState = 'thinking';
    } else {
      targetState = 'idle';
    }
  } else if (isThinking || isProcessing) {
    targetState = 'thinking';
  } else if (isSpeaking) {
    targetState = 'speaking';
  } else {
    targetState = 'idle';
  }

  // Bonus safeguard: If speaking requested but video not ready, fallback to idle
  const activeState = (targetState === 'speaking' && !isTalkingLoaded) ? 'idle' : targetState;

  return (
    <div
      className={`avatar-player-container ${className}`.trim()}
      style={{ '--avatar-aspect-ratio': aspectRatio } as React.CSSProperties}
      data-testid="avatar-player-container"
    >
      {/* 1. Idle Video Layer (Listening / Default) */}
      <video
        ref={idleVideoRef}
        src={idleVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        onCanPlay={handleIdleCanPlay}
        onLoadedData={handleIdleCanPlay}
        onError={() => onError?.(new Error(`Failed to load idle video: ${idleVideoSrc}`))}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="AI Interviewer Listening State"
        className={`avatar-player-layer avatar-player-video--idle ${
          activeState === 'idle' ? 'avatar-player-layer--visible' : 'avatar-player-layer--hidden'
        }`}
      />

      {/* 2. Talking Video Layer (Audio ON / Speaking) */}
      <video
        ref={talkingVideoRef}
        src={talkingVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        onCanPlay={handleTalkingCanPlay}
        onLoadedData={handleTalkingCanPlay}
        onError={() => onError?.(new Error(`Failed to load talking video: ${talkingVideoSrc}`))}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="AI Interviewer Talking State"
        className={`avatar-player-layer avatar-player-video--talking ${
          activeState === 'speaking' ? 'avatar-player-layer--visible' : 'avatar-player-layer--hidden'
        }`}
      />

      {/* 3. Still Image Layer (Thinking / Processing) */}
      <img
        src={stillImageSrc}
        alt="AI Interviewer Thinking State"
        loading="eager"
        onContextMenu={(e) => e.preventDefault()}
        className={`avatar-player-layer avatar-player-image--still ${
          activeState === 'thinking' ? 'avatar-player-layer--visible' : 'avatar-player-layer--hidden'
        }`}
      />

      {/* Status Overlay Badge */}
      {showStatusBadge && (
        <div className="avatar-player-status-badge">
          <span
            className={`avatar-player-status-dot ${
              activeState === 'speaking' ? 'avatar-player-status-dot--speaking' :
              activeState === 'thinking' ? 'avatar-player-status-dot--thinking' : ''
            }`}
          />
          <span>
            {activeState === 'speaking' ? 'AI Speaking' :
             activeState === 'thinking' ? 'AI Thinking...' : 'AI Listening'}
          </span>
        </div>
      )}
    </div>
  );
});

AvatarPlayer.displayName = 'AvatarPlayer';

export default AvatarPlayer;
