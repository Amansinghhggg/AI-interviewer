import { BROWSER_STATES, BROWSER_EVENTS } from '../utils/browserMonitoring.states';
import { BROWSER_MONITORING_CONFIG } from '../config/browserMonitoring.config';

export class BrowserMonitorService {
  constructor(onSnapshotUpdate) {
    this.onSnapshotUpdate = onSnapshotUpdate;
    this.isMonitoring = false;
    this.history = [];
    
    // Initial snapshot derived from current browser state
    this.snapshot = {
      focused: document.hasFocus(),
      visible: document.visibilityState === 'visible',
      fullscreen: !!document.fullscreenElement,
      online: navigator.onLine,
      timestamp: Date.now()
    };

    // Derived overall status
    this.status = this.deriveOverallStatus();

    // Bind event handlers to maintain `this` context and allow exact removal
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Attach listeners
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Initial broadcast
    this.updateSnapshot();
  }

  stop() {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    // Detach listeners cleanly
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  destroy() {
    this.stop();
    this.history = [];
    this.onSnapshotUpdate = null;
  }

  // ─── Event Handlers ─────────────────────────────────────

  handleFocus() {
    this.snapshot.focused = true;
    this.addHistoryEvent(BROWSER_EVENTS.WINDOW_FOCUSED, {
      wasVisible: this.snapshot.visible
    });
    this.processChanges();
  }

  handleBlur() {
    this.snapshot.focused = false;
    this.addHistoryEvent(BROWSER_EVENTS.WINDOW_BLURRED, {
      wasVisible: this.snapshot.visible
    });
    this.processChanges();
  }

  handleVisibilityChange() {
    const isVisible = document.visibilityState === 'visible';
    this.snapshot.visible = isVisible;
    
    if (isVisible) {
      this.addHistoryEvent(BROWSER_EVENTS.PAGE_VISIBLE);
    } else {
      this.addHistoryEvent(BROWSER_EVENTS.PAGE_HIDDEN);
    }
    this.processChanges();
  }

  handleFullscreenChange() {
    const isFullscreen = !!document.fullscreenElement;
    this.snapshot.fullscreen = isFullscreen;
    
    if (isFullscreen) {
      this.addHistoryEvent(BROWSER_EVENTS.FULLSCREEN_ENTERED);
    } else {
      this.addHistoryEvent(BROWSER_EVENTS.FULLSCREEN_EXITED);
    }
    this.processChanges();
  }

  handleOnline() {
    this.snapshot.online = true;
    this.addHistoryEvent(BROWSER_EVENTS.NETWORK_ONLINE);
    this.processChanges();
  }

  handleOffline() {
    this.snapshot.online = false;
    this.addHistoryEvent(BROWSER_EVENTS.NETWORK_OFFLINE);
    this.processChanges();
  }

  // ─── Internal Logic ──────────────────────────────────────

  deriveOverallStatus() {
    // Priority sequence: OFFLINE > BACKGROUND > UNFOCUSED > FULLSCREEN > ACTIVE
    if (!this.snapshot.online) {
      return BROWSER_STATES.OFFLINE;
    }
    if (!this.snapshot.visible) {
      return BROWSER_STATES.BACKGROUND;
    }
    if (!this.snapshot.focused) {
      return BROWSER_STATES.UNFOCUSED;
    }
    if (this.snapshot.fullscreen) {
      return BROWSER_STATES.FULLSCREEN;
    }
    return BROWSER_STATES.ACTIVE;
  }

  processChanges() {
    this.snapshot.timestamp = Date.now();
    this.status = this.deriveOverallStatus();
    this.updateSnapshot();
  }

  addHistoryEvent(eventName, metadata = {}) {
    this.history.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      event: eventName,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        // Always embed the basic facts into the event for context
        focused: this.snapshot.focused,
        visible: this.snapshot.visible,
        online: this.snapshot.online,
        fullscreen: this.snapshot.fullscreen
      }
    });

    if (this.history.length > BROWSER_MONITORING_CONFIG.MAX_HISTORY_LENGTH) {
      this.history.shift();
    }
  }

  updateSnapshot() {
    if (this.onSnapshotUpdate) {
      // Clone to prevent direct mutation bugs in React
      this.onSnapshotUpdate(
        JSON.parse(JSON.stringify(this.snapshot)),
        this.status,
        [...this.history]
      );
    }
  }
}
