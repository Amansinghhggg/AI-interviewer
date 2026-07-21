import { RECORDING_CONFIG } from '../config/recording.config';

/**
 * RecordingSession
 *
 * Lightweight model representing one completed recording lifecycle.
 * Plain object factory — keeps it serialization-friendly for future upload sprints.
 */

/**
 * Create a new RecordingSession object.
 * @param {object} params
 * @param {string} params.mimeType - Negotiated MIME type
 * @param {MediaStream} [params.stream] - The MediaStream used for recording (to extract metadata)
 * @returns {object} RecordingSession
 */
export const createRecordingSession = ({ mimeType, stream = null }) => {
  const metadata = extractMetadata(stream);

  return {
    /** Client-generated unique ID */
    id: crypto.randomUUID(),

    /** When recording began */
    startedAt: new Date(),

    /** When recording stopped — set on finalization */
    endedAt: null,

    /** Total recorded duration in ms (excludes paused time) — set on finalization */
    duration: 0,

    /** Negotiated MIME type */
    mimeType,

    /** Raw recorded chunks — populated during recording */
    chunks: [],

    /** Assembled Blob — set on finalization */
    blob: null,

    /** Recording metadata */
    metadata: {
      /** e.g. '1280x720' */
      resolution: metadata.resolution,

      /** Frames per second from video track */
      frameRate: metadata.frameRate,

      /** Video bitrate from config */
      videoBitrate: RECORDING_CONFIG.VIDEO_BITRATE,

      /** Audio bitrate from config */
      audioBitrate: RECORDING_CONFIG.AUDIO_BITRATE,
    },
  };
};

/**
 * Finalize a session after recording stops.
 * Assembles chunks into a Blob and sets end timestamp.
 * @param {object} session - RecordingSession to finalize
 * @param {number} duration - Total recorded duration in ms
 * @returns {object} Finalized RecordingSession
 */
export const finalizeRecordingSession = (session, duration) => {
  return {
    ...session,
    endedAt: new Date(),
    duration,
    blob: session.chunks.length > 0
      ? new Blob(session.chunks, { type: session.mimeType })
      : null,
  };
};

/**
 * Extract metadata from a MediaStream's active tracks.
 * @param {MediaStream|null} stream
 * @returns {{ resolution: string, frameRate: number|null }}
 */
const extractMetadata = (stream) => {
  if (!stream) {
    return { resolution: 'unknown', frameRate: null };
  }

  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) {
    return { resolution: 'unknown', frameRate: null };
  }

  const settings = videoTrack.getSettings();
  const width = settings.width || 0;
  const height = settings.height || 0;
  const frameRate = settings.frameRate || null;

  return {
    resolution: width && height ? `${width}x${height}` : 'unknown',
    frameRate,
  };
};
