import { useRef, useEffect } from 'react';

/**
 * VideoPreview
 *
 * Renders a live camera preview from a MediaStream.
 * Contains zero recording logic — purely presentational.
 *
 * @param {object} props
 * @param {MediaStream|null} props.stream - The MediaStream to display
 * @param {boolean} [props.mirrored=true] - Mirror the video (selfie mode)
 * @param {string} [props.className] - Additional CSS classes
 */
export const VideoPreview = ({ stream = null, mirrored = true, className = '' }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      videoEl.srcObject = stream;
    } else {
      videoEl.srcObject = null;
    }

    return () => {
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-dark-800 border border-dark-700 ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
