import { VIOLATION_TYPES, VIOLATION_SOURCES, VIOLATION_SEVERITY } from '../utils/violation.states';
import { DEVICE_HEALTH_EVENTS } from '../../device-health/utils/deviceHealth.states';

export class CameraDisconnectedRule {
  constructor() {
    this.type = VIOLATION_TYPES.CAMERA_DISCONNECTED;
    this.source = VIOLATION_SOURCES.DEVICE;
  }

  evaluate({ event, activeViolations, configuration }) {
    if (!configuration.cameraDisconnectEnabled) return null;

    if (
      event.event === DEVICE_HEALTH_EVENTS.CAMERA_DISCONNECTED || 
      event.event === DEVICE_HEALTH_EVENTS.CAMERA_PERMISSION_REVOKED
    ) {
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

    if (event.event === DEVICE_HEALTH_EVENTS.CAMERA_RECOVERED) {
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
