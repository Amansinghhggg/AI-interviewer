import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { FACE_DETECTION_CONFIG } from '../config/faceDetection.config';
import { FACE_STATES, FACE_EVENTS } from '../utils/faceDetection.states';

export class FaceDetectionService {
  constructor(onSnapshotUpdate) {
    this.onSnapshotUpdate = onSnapshotUpdate;
    this.videoElement = null;
    this.faceDetector = null;
    this.isMonitoring = false;
    this.lastDetectionTime = 0;
    this.animationFrameId = null;

    this.history = [];
    
    this.snapshot = {
      faceCount: 0,
      status: FACE_STATES.INITIALIZING,
      confidence: 0,
      timestamp: Date.now(),
      lastDetectedAt: 0
    };

    this.detectLoop = this.detectLoop.bind(this);
  }

  async initialize() {
    try {
      // Note: We use jsdelivr for the wasm execution environment (as is standard), 
      // but load the actual model from the local public path per requirements.
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
      );
      
      this.faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: FACE_DETECTION_CONFIG.MODEL_PATH,
          delegate: "GPU" // Preferred, falls back to CPU automatically
        },
        runningMode: "VIDEO",
      });

      this.addHistoryEvent(FACE_EVENTS.DETECTOR_INITIALIZED, { status: 'success' });
      
      // If start() was called before init finished, kick off the loop now
      if (this.isMonitoring && this.videoElement) {
        this.startDetectionLoop();
      }
    } catch (error) {
      console.error("[FaceDetectionService] Initialization error:", error);
      this.snapshot.status = FACE_STATES.ERROR;
      this.addHistoryEvent(FACE_EVENTS.DETECTOR_ERROR, { error: error.message });
      this.updateSnapshot();
    }
  }

  start(videoElement) {
    if (!videoElement) return;
    this.videoElement = videoElement;
    this.isMonitoring = true;
    
    // Only set to INITIALIZING if we don't already have a detector running
    if (!this.faceDetector) {
      this.snapshot.status = FACE_STATES.INITIALIZING;
      this.updateSnapshot();
    } else {
      this.startDetectionLoop();
    }
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stop();
    this.videoElement = null;
    if (this.faceDetector) {
      this.faceDetector.close();
      this.faceDetector = null;
    }
  }

  startDetectionLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.detectLoop();
  }

  detectLoop() {
    if (!this.isMonitoring || !this.faceDetector || !this.videoElement) return;

    const now = performance.now();
    
    // Throttle via requestAnimationFrame timestamp
    if (now - this.lastDetectionTime >= FACE_DETECTION_CONFIG.DETECTION_INTERVAL_MS) {
      // Ensure video has metadata and is playing
      if (this.videoElement.readyState >= 2 && !this.videoElement.paused) {
        try {
          const results = this.faceDetector.detectForVideo(this.videoElement, now);
          this.processResults(results);
          this.lastDetectionTime = now;
        } catch (e) {
          console.warn("[FaceDetectionService] Detection error:", e);
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(this.detectLoop);
  }

  processResults(results) {
    const faceCount = results.detections ? results.detections.length : 0;
    
    let confidence = 0;
    if (faceCount > 0) {
       // get max confidence across all detected faces
       confidence = Math.max(...results.detections.map(d => d.categories[0].score));
    }

    const previousStatus = this.snapshot.status;
    let newStatus = FACE_STATES.NO_FACE;

    if (faceCount === 1) {
      newStatus = FACE_STATES.ONE_FACE;
    } else if (faceCount > 1) {
      newStatus = FACE_STATES.MULTIPLE_FACES;
    }

    const now = Date.now();

    this.snapshot.faceCount = faceCount;
    this.snapshot.status = newStatus;
    this.snapshot.confidence = confidence;
    this.snapshot.timestamp = now;

    if (faceCount > 0) {
      this.snapshot.lastDetectedAt = now;
    }

    // Determine state transitions for structured events
    if (previousStatus === FACE_STATES.NO_FACE && newStatus === FACE_STATES.ONE_FACE) {
      this.addHistoryEvent(FACE_EVENTS.FACE_DETECTED, { faceCount, confidence });
    } else if ((previousStatus === FACE_STATES.ONE_FACE || previousStatus === FACE_STATES.MULTIPLE_FACES) && newStatus === FACE_STATES.NO_FACE) {
      this.addHistoryEvent(FACE_EVENTS.FACE_LOST, { faceCount, confidence });
    } else if (previousStatus !== FACE_STATES.MULTIPLE_FACES && newStatus === FACE_STATES.MULTIPLE_FACES) {
      this.addHistoryEvent(FACE_EVENTS.MULTIPLE_FACES_DETECTED, { faceCount, confidence });
    } else if (previousStatus === FACE_STATES.MULTIPLE_FACES && newStatus === FACE_STATES.ONE_FACE) {
      this.addHistoryEvent(FACE_EVENTS.MULTIPLE_FACES_RESOLVED, { faceCount, confidence });
    }

    this.updateSnapshot();
  }

  addHistoryEvent(eventName, metadata = {}) {
    this.history.push({
      event: eventName,
      timestamp: Date.now(),
      metadata
    });

    if (this.history.length > FACE_DETECTION_CONFIG.MAX_HISTORY_LENGTH) {
      this.history.shift();
    }
  }

  updateSnapshot() {
    if (this.onSnapshotUpdate) {
      // Clone snapshot to prevent reference mutation bugs
      this.onSnapshotUpdate(
        JSON.parse(JSON.stringify(this.snapshot)), 
        [...this.history]
      );
    }
  }
}
