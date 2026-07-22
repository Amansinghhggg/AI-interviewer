import { VIOLATION_TYPES, VIOLATION_SOURCES, VIOLATION_SEVERITY } from '../utils/violation.states';
import { BROWSER_EVENTS } from '../../browser-monitoring/utils/browserMonitoring.states';

export class PageHiddenRule {
  constructor() {
    this.type = VIOLATION_TYPES.PAGE_HIDDEN;
    this.source = VIOLATION_SOURCES.BROWSER;
  }

  evaluate({ event, activeViolations, configuration }) {
    if (!configuration.pageHiddenEnabled) return null;

    if (event.event === BROWSER_EVENTS.PAGE_HIDDEN) {
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

    if (event.event === BROWSER_EVENTS.PAGE_VISIBLE) {
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
