import { VIOLATION_TYPES, VIOLATION_SOURCES, VIOLATION_SEVERITY, VIOLATION_STATES } from '../utils/violation.states';
import { FACE_EVENTS } from '../../face-detection/utils/faceDetection.states';

export class NoFaceRule {
  constructor() {
    this.type = VIOLATION_TYPES.NO_FACE;
    this.source = VIOLATION_SOURCES.FACE;
  }

  evaluate({ event, activeViolations, configuration }) {
    // We only care about FACE_LOST and FACE_DETECTED events
    if (event.event === FACE_EVENTS.FACE_LOST) {
      // Return a pending violation action to be added when threshold is met,
      // but actually, "Time-based violations should be calculated using timestamps from incoming events."
      // "Duration = FaceDetected.timestamp - NoFace.timestamp"
      // Wait, if we wait for FaceDetected to create the violation, we won't know they are missing *until they return*.
      // Let's rethink. If they leave the camera, how do we trigger an active violation *during* their absence without a loop?
      // Ah. The prompt specifically said:
      // "4. Use Event Timestamps
      // Avoid internal polling loops. Avoid requestAnimationFrame. Avoid setInterval.
      // Time-based violations should be calculated using timestamps from incoming events.
      // Example:
      // No Face -> Face Detected -> Duration = FaceDetected.timestamp - NoFace.timestamp"
      // This implies the violation is created/recorded when the state *resolves* (or is updated upon next event).
      // Or maybe we record an ACTIVE violation immediately on FACE_LOST, and calculate duration later?
      // "NoFaceRule -> ACTIVE immediately, but maybe its severity or validity depends on duration?"
      // If we create it immediately, it's ACTIVE. Then when FACE_DETECTED occurs, we resolve it.
      
      // Let's emit a violation immediately on FACE_LOST.
      return {
        action: 'ADD',
        violation: {
          type: this.type,
          source: this.source,
          severity: VIOLATION_SEVERITY.WARNING,
          startedAt: event.timestamp,
          metadata: event.metadata
        }
      };
    }

    if (event.event === FACE_EVENTS.FACE_DETECTED || event.event === FACE_EVENTS.MULTIPLE_FACES_DETECTED) {
      // Find active NO_FACE violation
      const active = activeViolations.find(v => v.type === this.type);
      if (active) {
        const duration = event.timestamp - active.startedAt;
        
        // If duration is less than threshold, we could IGNORE it or keep it as RESOLVED.
        // Let's RESOLVE it and record the duration.
        if (duration < configuration.noFaceThresholdMs) {
           return {
             action: 'REMOVE', // or 'IGNORE' if it didn't meet the threshold
             violationId: active.id
           };
        } else {
           return {
             action: 'RESOLVE',
             violationId: active.id,
             endedAt: event.timestamp,
             duration
           };
        }
      }
    }

    return null; // No action
  }
}
