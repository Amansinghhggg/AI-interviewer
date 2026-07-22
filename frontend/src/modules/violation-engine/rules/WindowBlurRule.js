import { VIOLATION_TYPES, VIOLATION_SOURCES, VIOLATION_SEVERITY } from '../utils/violation.states';
import { BROWSER_EVENTS } from '../../browser-monitoring/utils/browserMonitoring.states';

export class WindowBlurRule {
  constructor() {
    this.type = VIOLATION_TYPES.WINDOW_BLURRED;
    this.source = VIOLATION_SOURCES.BROWSER;
  }

  evaluate({ event, activeViolations, configuration }) {
    if (!configuration.blurEnabled) return null;

    if (event.event === BROWSER_EVENTS.WINDOW_BLURRED) {
      const active = activeViolations.find(v => v.type === this.type);
      if (!active) {
        return {
          action: 'ADD',
          violation: {
            type: this.type,
            source: this.source,
            severity: VIOLATION_SEVERITY.WARNING, // Blur is usually just a warning
            startedAt: event.timestamp,
            metadata: event.metadata
          }
        };
      }
    }

    if (event.event === BROWSER_EVENTS.WINDOW_FOCUSED) {
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
