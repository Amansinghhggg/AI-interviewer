import { VIOLATION_TYPES, VIOLATION_SOURCES, VIOLATION_SEVERITY } from '../utils/violation.states';
import { FACE_EVENTS } from '../../face-detection/utils/faceDetection.states';

export class MultipleFacesRule {
  constructor() {
    this.type = VIOLATION_TYPES.MULTIPLE_FACES;
    this.source = VIOLATION_SOURCES.FACE;
  }

  evaluate({ event, activeViolations, configuration }) {
    if (!configuration.multipleFacesEnabled) return null;

    if (event.event === FACE_EVENTS.MULTIPLE_FACES_DETECTED) {
      const active = activeViolations.find(v => v.type === this.type);
      if (!active) {
        return {
          action: 'ADD',
          violation: {
            type: this.type,
            source: this.source,
            severity: VIOLATION_SEVERITY.CRITICAL,
            startedAt: event.timestamp,
            metadata: event.metadata
          }
        };
      }
    }

    if (event.event === FACE_EVENTS.FACE_DETECTED || event.event === FACE_EVENTS.FACE_LOST) {
      const active = activeViolations.find(v => v.type === this.type);
      if (active) {
        return {
          action: 'RESOLVE',
          violationId: active.id,
          endedAt: event.timestamp,
          duration: event.timestamp - active.startedAt
        };
      }
    }

    return null;
  }
}
