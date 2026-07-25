import { useRef, useEffect } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { CAMERA_STATES } from '../utils/camera.states';
import { DeviceHealthIndicator } from '../../device-health/index';
import { FaceStatusIndicator } from '../../face-detection/index';
import { BrowserStatusIndicator } from '../../browser-monitoring/index';
import { ViolationIndicator } from '../../violation-engine/index';

/**
 * InterviewCamera
 *
 * Purely presentational camera component.
 * Receives stream, state, and warnings via props — does NOT access MediaDevices APIs.
 *
 * @param {object} props
 * @param {MediaStream|null} props.stream - The camera MediaStream
 * @param {string} props.state - CAMERA_STATES value
 * @param {Array<string>} [props.warnings] - Warning messages (reserved for future monitoring)
 * @param {{ code: string, message: string }|null} [props.error] - Camera error object
 * @param {object} [props.deviceSnapshot] - Device health snapshot
 * @param {object} [props.faceSnapshot] - Face detection snapshot
 * @param {string} [props.browserStatus] - Browser status string
 * @param {Array} [props.activeViolations] - Active violations
 * @param {function} [props.setVideoElement] - Callback to pass video element to detectors
 */
export const InterviewCamera = ({ 
  stream = null, 
  state = CAMERA_STATES.IDLE, 
  warnings = [], 
  error = null, 
  isRecording = false, 
  deviceSnapshot = null,
  faceSnapshot = null,
  browserStatus = null,
  activeViolations = [],
  setVideoElement = null 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      videoEl.srcObject = stream;
    } else {
      videoEl.srcObject = null;
    }

    if (setVideoElement) {
      setVideoElement(videoEl);
    }

    return () => {
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [stream, setVideoElement]);

  return (
    <div className={`camera-container relative overflow-hidden rounded-2xl bg-dark-800 aspect-video w-full transition-all duration-500 ${
      isRecording 
        ? 'border border-primary-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
        : 'border border-dark-700'
    }`}>
      {/* Violation Status Overlay (Top Center) */}
      {activeViolations && activeViolations.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <ViolationIndicator activeViolations={activeViolations} />
        </div>
      )}

      {/* Browser Status Overlay (Top Center, pushed down if violations exist) */}
      {browserStatus && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${activeViolations?.length > 0 ? 'top-14' : 'top-4'}`}>
          <BrowserStatusIndicator status={browserStatus} />
        </div>
      )}

      {/* Device Health Overlay (Top Right) */}
      {deviceSnapshot && (
        <div className="absolute top-4 right-4 z-10">
          <DeviceHealthIndicator snapshot={deviceSnapshot} />
        </div>
      )}

      {/* Face Status Overlay (Top Left) */}
      {faceSnapshot && (
        <div className="absolute top-4 left-4 z-10">
          <FaceStatusIndicator snapshot={faceSnapshot} />
        </div>
      )}

      {/* Active Camera Stream */}
      {state === CAMERA_STATES.ACTIVE && stream && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ transform: 'scaleX(-1)' }}
          className="w-full h-full object-cover"
        />
      )}

      {/* Initializing State */}
      {state === CAMERA_STATES.INITIALIZING && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-dark-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          <span className="text-sm">Starting camera...</span>
        </div>
      )}

      {/* Idle State — Camera Not Started */}
      {state === CAMERA_STATES.IDLE && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-dark-500">
          <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          <span className="text-sm">Camera preview</span>
        </div>
      )}

      {/* Error State */}
      {state === CAMERA_STATES.ERROR && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
          <div className="w-16 h-16 rounded-full bg-danger-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-sm text-dark-400 text-center max-w-[200px]">
            {error?.message || 'Camera unavailable'}
          </p>
        </div>
      )}

      {/* Recording Badge Placeholder — reserved for future recording module */}
      <div className="absolute top-3 left-3">
        {/* RecordingIndicator will be placed here in the recording sprint */}
      </div>

      {/* Monitoring Overlay Placeholder — reserved for future monitoring */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Face detection / monitoring overlay will be placed here */}
      </div>

      {/* Warning Placeholder — reserved for future warnings */}
      {warnings.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3">
          {warnings.map((warning, i) => (
            <div key={i} className="text-xs text-warning-400 bg-dark-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg mb-1">
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
