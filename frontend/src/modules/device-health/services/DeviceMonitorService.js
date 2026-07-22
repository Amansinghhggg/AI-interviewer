import { DEVICE_HEALTH_CONFIG } from '../config/deviceHealth.config';
import { DEVICE_HEALTH_STATES, DEVICE_HEALTH_EVENTS } from '../utils/deviceHealth.states';
import { DeviceCapabilities } from '../utils/device.capabilities';

export class DeviceMonitorService {
  constructor(onSnapshotUpdate) {
    this.onSnapshotUpdate = onSnapshotUpdate;
    this.stream = null;
    this.videoTrack = null;
    this.audioTrack = null;

    this.history = [];
    
    this.snapshot = {
      camera: { state: DEVICE_HEALTH_STATES.INITIALIZING, label: 'Unknown' },
      microphone: { state: DEVICE_HEALTH_STATES.INITIALIZING, label: 'Unknown' },
      permissions: { camera: 'unknown', microphone: 'unknown' },
      overall: DEVICE_HEALTH_STATES.INITIALIZING,
      issues: [],
      lastUpdated: Date.now()
    };

    this.recoveryTimers = {
      camera: null,
      microphone: null
    };
    
    this.permissionStatuses = {
      camera: null,
      microphone: null
    };

    this.checkInterval = null;

    // Bind event handlers
    this.handleDeviceChange = this.handleDeviceChange.bind(this);
    this.handleCameraEnd = this.handleCameraEnd.bind(this);
    this.handleMicrophoneEnd = this.handleMicrophoneEnd.bind(this);
    this.handleCameraMute = this.handleCameraMute.bind(this);
    this.handleCameraUnmute = this.handleCameraUnmute.bind(this);
    this.handleMicrophoneMute = this.handleMicrophoneMute.bind(this);
    this.handleMicrophoneUnmute = this.handleMicrophoneUnmute.bind(this);
    this.performFallbackCheck = this.performFallbackCheck.bind(this);
  }

  start(stream) {
    this.stream = stream;
    if (this.stream) {
      this.videoTrack = this.stream.getVideoTracks()[0] || null;
      this.audioTrack = this.stream.getAudioTracks()[0] || null;

      if (this.videoTrack) {
        this.snapshot.camera.label = this.videoTrack.label;
        this.snapshot.camera.state = DEVICE_HEALTH_STATES.HEALTHY;
        this.addHistoryEvent(DEVICE_HEALTH_EVENTS.CAMERA_STARTED);
      } else {
        this.snapshot.camera.state = DEVICE_HEALTH_STATES.ERROR;
      }
      
      if (this.audioTrack) {
        this.snapshot.microphone.label = this.audioTrack.label;
        this.snapshot.microphone.state = DEVICE_HEALTH_STATES.HEALTHY;
      } else {
        this.snapshot.microphone.state = DEVICE_HEALTH_STATES.ERROR;
      }

      this.attachTrackListeners();
    }
    
    this.initPermissions();

    if (DeviceCapabilities.deviceChangeSupported) {
      navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange);
    }

    // Start fallback periodic check
    this.checkInterval = setInterval(this.performFallbackCheck, DEVICE_HEALTH_CONFIG.FALLBACK_CHECK_INTERVAL);

    this.updateOverallHealth();
  }

  stop() {
    this.detachTrackListeners();
    
    if (DeviceCapabilities.deviceChangeSupported) {
      navigator.mediaDevices.removeEventListener('devicechange', this.handleDeviceChange);
    }

    if (this.permissionStatuses.camera) {
      this.permissionStatuses.camera.onchange = null;
    }
    if (this.permissionStatuses.microphone) {
      this.permissionStatuses.microphone.onchange = null;
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.clearRecoveryTimers();
  }

  attachTrackListeners() {
    if (this.videoTrack) {
      this.videoTrack.addEventListener('ended', this.handleCameraEnd);
      this.videoTrack.addEventListener('mute', this.handleCameraMute);
      this.videoTrack.addEventListener('unmute', this.handleCameraUnmute);
    }
    if (this.audioTrack) {
      this.audioTrack.addEventListener('ended', this.handleMicrophoneEnd);
      this.audioTrack.addEventListener('mute', this.handleMicrophoneMute);
      this.audioTrack.addEventListener('unmute', this.handleMicrophoneUnmute);
    }
  }

  detachTrackListeners() {
    if (this.videoTrack) {
      this.videoTrack.removeEventListener('ended', this.handleCameraEnd);
      this.videoTrack.removeEventListener('mute', this.handleCameraMute);
      this.videoTrack.removeEventListener('unmute', this.handleCameraUnmute);
    }
    if (this.audioTrack) {
      this.audioTrack.removeEventListener('ended', this.handleMicrophoneEnd);
      this.audioTrack.removeEventListener('mute', this.handleMicrophoneMute);
      this.audioTrack.removeEventListener('unmute', this.handleMicrophoneUnmute);
    }
  }

  async initPermissions() {
    if (!DeviceCapabilities.permissionsSupported) return;

    try {
      this.permissionStatuses.camera = await navigator.permissions.query({ name: 'camera' });
      this.snapshot.permissions.camera = this.permissionStatuses.camera.state;
      this.permissionStatuses.camera.onchange = () => {
        this.snapshot.permissions.camera = this.permissionStatuses.camera.state;
        if (this.permissionStatuses.camera.state === 'denied') {
          this.addHistoryEvent(DEVICE_HEALTH_EVENTS.CAMERA_PERMISSION_REVOKED);
          this.snapshot.camera.state = DEVICE_HEALTH_STATES.ERROR;
        }
        this.updateOverallHealth();
      };
    } catch (e) {
      console.warn('Camera permission query failed:', e);
    }

    try {
      this.permissionStatuses.microphone = await navigator.permissions.query({ name: 'microphone' });
      this.snapshot.permissions.microphone = this.permissionStatuses.microphone.state;
      this.permissionStatuses.microphone.onchange = () => {
        this.snapshot.permissions.microphone = this.permissionStatuses.microphone.state;
        if (this.permissionStatuses.microphone.state === 'denied') {
          this.addHistoryEvent(DEVICE_HEALTH_EVENTS.MICROPHONE_PERMISSION_REVOKED);
          this.snapshot.microphone.state = DEVICE_HEALTH_STATES.ERROR;
        }
        this.updateOverallHealth();
      };
    } catch (e) {
      console.warn('Microphone permission query failed:', e);
    }
    
    this.updateOverallHealth();
  }

  handleDeviceChange() {
    this.addHistoryEvent(DEVICE_HEALTH_EVENTS.DEVICE_CHANGED);
    // As instructed, we just emit the event. We don't automatically switch streams.
    this.updateOverallHealth();
  }

  handleCameraEnd() {
    this.startRecoveryTimer('camera', DEVICE_HEALTH_EVENTS.CAMERA_DISCONNECTED, () => {
      this.snapshot.camera.state = DEVICE_HEALTH_STATES.WARNING;
      this.updateOverallHealth();
    });
  }

  handleCameraMute() {
    this.startRecoveryTimer('camera', DEVICE_HEALTH_EVENTS.CAMERA_DISCONNECTED, () => {
      this.snapshot.camera.state = DEVICE_HEALTH_STATES.WARNING;
      this.updateOverallHealth();
    });
  }

  handleCameraUnmute() {
    this.cancelRecoveryTimer('camera');
    if (this.snapshot.camera.state !== DEVICE_HEALTH_STATES.HEALTHY) {
      this.addHistoryEvent(DEVICE_HEALTH_EVENTS.CAMERA_RECOVERED);
      this.snapshot.camera.state = DEVICE_HEALTH_STATES.HEALTHY;
      this.updateOverallHealth();
    }
  }

  handleMicrophoneEnd() {
    this.startRecoveryTimer('microphone', DEVICE_HEALTH_EVENTS.MICROPHONE_DISCONNECTED, () => {
      this.snapshot.microphone.state = DEVICE_HEALTH_STATES.WARNING;
      this.updateOverallHealth();
    });
  }

  handleMicrophoneMute() {
    this.startRecoveryTimer('microphone', DEVICE_HEALTH_EVENTS.MICROPHONE_DISCONNECTED, () => {
      this.snapshot.microphone.state = DEVICE_HEALTH_STATES.WARNING;
      this.updateOverallHealth();
    });
  }

  handleMicrophoneUnmute() {
    this.cancelRecoveryTimer('microphone');
    if (this.snapshot.microphone.state !== DEVICE_HEALTH_STATES.HEALTHY) {
      this.addHistoryEvent(DEVICE_HEALTH_EVENTS.MICROPHONE_RECOVERED);
      this.snapshot.microphone.state = DEVICE_HEALTH_STATES.HEALTHY;
      this.updateOverallHealth();
    }
  }

  startRecoveryTimer(deviceType, eventName, onWarningCb) {
    if (this.recoveryTimers[deviceType]) return; // Already recovering
    
    // Immediately log disconnect event and set to recovering
    this.addHistoryEvent(eventName);
    this.snapshot[deviceType].state = DEVICE_HEALTH_STATES.RECOVERING;
    this.updateOverallHealth();

    this.recoveryTimers[deviceType] = setTimeout(() => {
      onWarningCb();
      this.recoveryTimers[deviceType] = null;
    }, DEVICE_HEALTH_CONFIG.RECOVERY_WINDOW_MS);
  }

  cancelRecoveryTimer(deviceType) {
    if (this.recoveryTimers[deviceType]) {
      clearTimeout(this.recoveryTimers[deviceType]);
      this.recoveryTimers[deviceType] = null;
    }
  }

  clearRecoveryTimers() {
    this.cancelRecoveryTimer('camera');
    this.cancelRecoveryTimer('microphone');
  }

  performFallbackCheck() {
    let changed = false;
    
    if (this.videoTrack) {
      const isMutedOrEnded = this.videoTrack.muted || this.videoTrack.readyState === 'ended';
      if (isMutedOrEnded && this.snapshot.camera.state === DEVICE_HEALTH_STATES.HEALTHY) {
        this.handleCameraMute();
        changed = true;
      } else if (!isMutedOrEnded && this.snapshot.camera.state !== DEVICE_HEALTH_STATES.HEALTHY && this.snapshot.camera.state !== DEVICE_HEALTH_STATES.RECOVERING) {
        this.handleCameraUnmute();
        changed = true;
      }
    }

    if (this.audioTrack) {
      const isMutedOrEnded = this.audioTrack.muted || this.audioTrack.readyState === 'ended';
      if (isMutedOrEnded && this.snapshot.microphone.state === DEVICE_HEALTH_STATES.HEALTHY) {
        this.handleMicrophoneMute();
        changed = true;
      } else if (!isMutedOrEnded && this.snapshot.microphone.state !== DEVICE_HEALTH_STATES.HEALTHY && this.snapshot.microphone.state !== DEVICE_HEALTH_STATES.RECOVERING) {
        this.handleMicrophoneUnmute();
        changed = true;
      }
    }

    if (changed) {
      this.updateOverallHealth();
    }
  }

  addHistoryEvent(eventName) {
    this.history.push({
      event: eventName,
      timestamp: Date.now()
    });
    
    if (this.history.length > DEVICE_HEALTH_CONFIG.MAX_HISTORY_LENGTH) {
      this.history.shift();
    }
  }

  updateOverallHealth() {
    const issues = [];
    let overall = DEVICE_HEALTH_STATES.HEALTHY;

    // Check camera
    if (this.snapshot.permissions.camera === 'denied') {
      issues.push('CAMERA_PERMISSION_DENIED');
      overall = DEVICE_HEALTH_STATES.ERROR;
    } else if (this.snapshot.camera.state === DEVICE_HEALTH_STATES.ERROR) {
      issues.push('CAMERA_ERROR');
      overall = DEVICE_HEALTH_STATES.ERROR;
    } else if (this.snapshot.camera.state === DEVICE_HEALTH_STATES.WARNING || this.snapshot.camera.state === DEVICE_HEALTH_STATES.RECOVERING) {
      issues.push('CAMERA_INTERRUPTED');
      if (overall === DEVICE_HEALTH_STATES.HEALTHY) overall = DEVICE_HEALTH_STATES.WARNING;
    }

    // Check microphone
    if (this.snapshot.permissions.microphone === 'denied') {
      issues.push('MICROPHONE_PERMISSION_DENIED');
      overall = DEVICE_HEALTH_STATES.ERROR;
    } else if (this.snapshot.microphone.state === DEVICE_HEALTH_STATES.ERROR) {
      issues.push('MICROPHONE_ERROR');
      overall = DEVICE_HEALTH_STATES.ERROR;
    } else if (this.snapshot.microphone.state === DEVICE_HEALTH_STATES.WARNING || this.snapshot.microphone.state === DEVICE_HEALTH_STATES.RECOVERING) {
      issues.push('MICROPHONE_INTERRUPTED');
      if (overall === DEVICE_HEALTH_STATES.HEALTHY) overall = DEVICE_HEALTH_STATES.WARNING;
    }

    this.snapshot.issues = issues;
    this.snapshot.overall = overall;
    this.snapshot.lastUpdated = Date.now();

    // Broadcast new snapshot to hook
    if (this.onSnapshotUpdate) {
      // Clone snapshot to prevent reference mutation bugs
      this.onSnapshotUpdate(JSON.parse(JSON.stringify(this.snapshot)), [...this.history]);
    }
  }
}
