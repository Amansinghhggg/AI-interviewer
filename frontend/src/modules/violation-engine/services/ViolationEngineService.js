import { NoFaceRule } from '../rules/NoFaceRule';
import { MultipleFacesRule } from '../rules/MultipleFacesRule';
import { PageHiddenRule } from '../rules/PageHiddenRule';
import { WindowBlurRule } from '../rules/WindowBlurRule';
import { OfflineRule } from '../rules/OfflineRule';
import { CameraDisconnectedRule } from '../rules/CameraDisconnectedRule';
import { MicrophoneDisconnectedRule } from '../rules/MicrophoneDisconnectedRule';
import { VIOLATION_SEVERITY } from '../utils/violation.states';

export class ViolationEngineService {
  constructor(config, onStateUpdate) {
    this.config = config;
    this.onStateUpdate = onStateUpdate;
    
    // Core state
    this.activeViolations = [];
    this.resolvedViolations = [];
    this.timeline = [];
    
    // Derived statistics
    this.statistics = {
      totalViolations: 0,
      activeViolations: 0,
      resolvedViolations: 0,
      warningCount: 0,
      criticalCount: 0,
      totalViolationDuration: 0
    };

    // Instantiate rule pipeline
    this.rules = [
      new NoFaceRule(),
      new MultipleFacesRule(),
      new PageHiddenRule(),
      new WindowBlurRule(),
      new OfflineRule(),
      new CameraDisconnectedRule(),
      new MicrophoneDisconnectedRule()
    ];
  }

  processEvent(event) {
    if (!event || !event.event) return;

    let stateChanged = false;

    // Build context once per event
    const context = {
      event,
      activeViolations: this.activeViolations,
      history: this.timeline,
      configuration: this.config
    };

    // Pass through all rules
    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      
      if (result) {
        if (result.action === 'ADD') {
          this.handleAdd(result.violation, event);
          stateChanged = true;
        } else if (result.action === 'REMOVE') {
          this.handleRemove(result.violationId);
          stateChanged = true;
        } else if (result.action === 'RESOLVE') {
          this.handleResolve(result.violationId, result.endedAt, result.duration);
          stateChanged = true;
        }
      }
    }

    if (stateChanged) {
      this.recalculateStatistics();
      this.broadcastState();
    }
  }

  handleAdd(violation, triggeringEvent) {
    const newViolation = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      ...violation
    };
    
    this.activeViolations.push(newViolation);
    
    this.timeline.push({
      violationId: newViolation.id,
      event: 'VIOLATION_STARTED',
      source: newViolation.source,
      timestamp: newViolation.startedAt,
      metadata: {
        type: newViolation.type,
        severity: newViolation.severity,
        triggeringEvent: triggeringEvent.event
      }
    });
  }

  handleRemove(violationId) {
    // Remove without recording it in resolved (used when threshold not met)
    this.activeViolations = this.activeViolations.filter(v => v.id !== violationId);
    
    // Also prune the 'VIOLATION_STARTED' from timeline to keep it clean
    this.timeline = this.timeline.filter(entry => entry.violationId !== violationId);
  }

  handleResolve(violationId, endedAt, duration) {
    const violationIndex = this.activeViolations.findIndex(v => v.id === violationId);
    if (violationIndex === -1) return;

    const violation = this.activeViolations[violationIndex];
    this.activeViolations.splice(violationIndex, 1);
    
    const resolvedViolation = {
      ...violation,
      endedAt,
      duration
    };
    this.resolvedViolations.push(resolvedViolation);

    this.timeline.push({
      violationId,
      event: 'VIOLATION_RESOLVED',
      source: violation.source,
      timestamp: endedAt,
      metadata: {
        type: violation.type,
        duration
      }
    });
  }

  recalculateStatistics() {
    let warningCount = 0;
    let criticalCount = 0;
    
    this.activeViolations.forEach(v => {
      if (v.severity === VIOLATION_SEVERITY.WARNING) warningCount++;
      if (v.severity === VIOLATION_SEVERITY.CRITICAL) criticalCount++;
    });

    const totalDuration = this.resolvedViolations.reduce((sum, v) => sum + (v.duration || 0), 0);

    this.statistics = {
      totalViolations: this.resolvedViolations.length + this.activeViolations.length,
      activeViolations: this.activeViolations.length,
      resolvedViolations: this.resolvedViolations.length,
      warningCount,
      criticalCount,
      totalViolationDuration: totalDuration
    };
  }

  broadcastState() {
    if (this.onStateUpdate) {
      // Clone deeply to prevent mutation issues
      this.onStateUpdate(
        JSON.parse(JSON.stringify(this.activeViolations)),
        JSON.parse(JSON.stringify(this.resolvedViolations)),
        JSON.parse(JSON.stringify(this.timeline)),
        JSON.parse(JSON.stringify(this.statistics))
      );
    }
  }

  destroy() {
    this.activeViolations = [];
    this.resolvedViolations = [];
    this.timeline = [];
    this.onStateUpdate = null;
  }
}
