import { RECORDING_CONFIG } from '../config/recording.config';
import { RECORDING_STATES } from '../utils/recording.states';
import {
  RECORDING_ERRORS,
  createRecordingError,
} from '../utils/recording.errors';
import {
  createRecordingSession,
  finalizeRecordingSession,
} from '../utils/RecordingSession';

/**
 * MediaRecordingService
 *
 * Event-driven, framework-agnostic service that wraps the browser
 * MediaRecorder API. The MediaRecorder instance is completely private.
 *
 * Emitted events:
 *   - recordingStarted  { mimeType, timestamp }
 *   - recordingPaused   { timestamp }
 *   - recordingResumed  { timestamp }
 *   - chunkAvailable    { chunk: Blob, index: number }
 *   - recordingStopped  { session: RecordingSession }
 *   - recordingError    { error: RecordingError }
 */
export class MediaRecordingService {
  /** @private */
  #recorder = null;

  /** @private */
  #state = RECORDING_STATES.IDLE;

  /** @private */
  #mimeType = null;

  /** @private */
  #session = null;

  /** @private */
  #chunkIndex = 0;

  /** @private */
  #listeners = {};

  /** @private - resolve function for stop() promise */
  #stopResolve = null;

  // ─── Event Emitter ───────────────────────────────────────────

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (!this.#listeners[event]) {
      this.#listeners[event] = [];
    }
    this.#listeners[event].push(handler);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    if (!this.#listeners[event]) return;
    this.#listeners[event] = this.#listeners[event].filter((h) => h !== handler);
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    if (!this.#listeners[event]) return;
    for (const handler of this.#listeners[event]) {
      try {
        handler(data);
      } catch (err) {
        console.error(`[MediaRecordingService] Error in ${event} handler:`, err);
      }
    }
  }

  // ─── Static Helpers ──────────────────────────────────────────

  /**
   * Detect the first supported MIME type from the preferred list.
   * @returns {string|null}
   */
  static getSupportedMimeType() {
    if (!window.MediaRecorder) return null;

    for (const mimeType of RECORDING_CONFIG.PREFERRED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return null;
  }

  // ─── Public API ──────────────────────────────────────────────

  /**
   * Initialize the service with a MediaStream.
   * Detects supported MIME type, constructs MediaRecorder, and binds handlers.
   *
   * @param {MediaStream} stream - The media stream to record
   * @throws {RecordingError} If no supported MIME type is found
   */
  initialize(stream) {
    // Detect MIME type
    this.#mimeType = MediaRecordingService.getSupportedMimeType();
    if (!this.#mimeType) {
      const error = createRecordingError(RECORDING_ERRORS.NO_SUPPORTED_MIME_TYPE);
      this.#state = RECORDING_STATES.ERROR;
      this.emit('recordingError', { error });
      throw error;
    }

    // Create MediaRecorder with configured bitrates
    this.#recorder = new MediaRecorder(stream, {
      mimeType: this.#mimeType,
      videoBitsPerSecond: RECORDING_CONFIG.VIDEO_BITRATE,
      audioBitsPerSecond: RECORDING_CONFIG.AUDIO_BITRATE,
    });

    // Create session
    this.#session = createRecordingSession({
      mimeType: this.#mimeType,
      stream,
    });

    this.#chunkIndex = 0;

    // Bind MediaRecorder handlers
    this.#recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.#session.chunks.push(event.data);
        this.emit('chunkAvailable', {
          chunk: event.data,
          index: this.#chunkIndex++,
        });
      }
    };

    this.#recorder.onerror = (event) => {
      const error = createRecordingError(
        RECORDING_ERRORS.RECORDER_ERROR,
        event.error || new Error('MediaRecorder error')
      );
      this.#state = RECORDING_STATES.ERROR;
      this.emit('recordingError', { error });
    };

    this.#recorder.onstop = () => {
      // onstop fires after all pending ondataavailable events
      // Finalization is handled here so stop() can resolve with the session
      if (this.#stopResolve && this.#session) {
        // Duration is set by the hook (it tracks paused time)
        // We pass 0 here — the hook will set the real duration
        const finalized = finalizeRecordingSession(this.#session, this.#session.duration);
        this.#session = finalized;
        this.#state = RECORDING_STATES.STOPPED;
        this.emit('recordingStopped', { session: finalized });
        this.#stopResolve(finalized);
        this.#stopResolve = null;
      }
    };

    this.#state = RECORDING_STATES.IDLE;
  }

  /**
   * Begin recording with the configured timeslice.
   */
  start() {
    if (!this.#recorder || this.#recorder.state !== 'inactive') {
      return;
    }

    this.#recorder.start(RECORDING_CONFIG.TIMESLICE_MS);
    this.#state = RECORDING_STATES.RECORDING;
    this.emit('recordingStarted', {
      mimeType: this.#mimeType,
      timestamp: Date.now(),
    });
  }

  /**
   * Stop recording and finalize the session.
   * @param {number} duration - Total recorded duration in ms (set by the hook)
   * @returns {Promise<RecordingSession>}
   */
  stop(duration = 0) {
    return new Promise((resolve) => {
      if (!this.#recorder || this.#recorder.state === 'inactive') {
        // Already stopped — resolve with current session
        if (this.#session) {
          const finalized = finalizeRecordingSession(this.#session, duration);
          this.#session = finalized;
          this.#state = RECORDING_STATES.STOPPED;
          resolve(finalized);
        } else {
          resolve(null);
        }
        return;
      }

      // Set duration on session before finalization
      if (this.#session) {
        this.#session.duration = duration;
      }

      this.#stopResolve = resolve;
      this.#recorder.stop();
    });
  }

  /**
   * Pause the recording.
   */
  pause() {
    if (!this.#recorder || this.#recorder.state !== 'recording') {
      return;
    }

    this.#recorder.pause();
    this.#state = RECORDING_STATES.PAUSED;
    this.emit('recordingPaused', { timestamp: Date.now() });
  }

  /**
   * Resume a paused recording.
   */
  resume() {
    if (!this.#recorder || this.#recorder.state !== 'paused') {
      return;
    }

    this.#recorder.resume();
    this.#state = RECORDING_STATES.RECORDING;
    this.emit('recordingResumed', { timestamp: Date.now() });
  }

  /**
   * Get the current recording state.
   * @returns {string} RECORDING_STATES value
   */
  getState() {
    return this.#state;
  }

  /**
   * Get a copy of the current chunks array.
   * @returns {Blob[]}
   */
  getChunks() {
    return this.#session ? [...this.#session.chunks] : [];
  }

  /**
   * Get the negotiated MIME type.
   * @returns {string|null}
   */
  getMimeType() {
    return this.#mimeType;
  }

  /**
   * Get the current session (may be partial if still recording).
   * @returns {object|null}
   */
  getSession() {
    return this.#session;
  }

  /**
   * Full teardown — release MediaRecorder reference, clear listeners and chunks.
   * Does NOT stop MediaStream tracks — that's the hook's responsibility.
   */
  destroy() {
    if (this.#recorder && this.#recorder.state !== 'inactive') {
      try {
        this.#recorder.stop();
      } catch {
        // Ignore — recorder may already be in a bad state
      }
    }

    this.#recorder = null;
    this.#session = null;
    this.#mimeType = null;
    this.#chunkIndex = 0;
    this.#stopResolve = null;
    this.#state = RECORDING_STATES.IDLE;
    this.#listeners = {};
  }
}
