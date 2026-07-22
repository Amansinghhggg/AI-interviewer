import { AlertTriangle, AlertCircle } from 'lucide-react';
import { VIOLATION_SEVERITY, VIOLATION_TYPES } from '../utils/violation.states';

const VIOLATION_LABELS = {
  [VIOLATION_TYPES.NO_FACE]: 'Face not detected',
  [VIOLATION_TYPES.MULTIPLE_FACES]: 'Multiple faces detected',
  [VIOLATION_TYPES.PAGE_HIDDEN]: 'Interview tab hidden',
  [VIOLATION_TYPES.WINDOW_BLURRED]: 'Browser unfocused',
  [VIOLATION_TYPES.OFFLINE]: 'Network connection lost',
  [VIOLATION_TYPES.CAMERA_DISCONNECTED]: 'Camera disconnected',
  [VIOLATION_TYPES.MICROPHONE_DISCONNECTED]: 'Microphone disconnected'
};

export const ViolationIndicator = ({ activeViolations = [] }) => {
  if (activeViolations.length === 0) return null;

  // Display only the most severe violation to avoid clutter
  const critical = activeViolations.find(v => v.severity === VIOLATION_SEVERITY.CRITICAL);
  const displayViolation = critical || activeViolations[0];
  
  const isCritical = displayViolation.severity === VIOLATION_SEVERITY.CRITICAL;
  const label = VIOLATION_LABELS[displayViolation.type] || 'Monitoring Alert';
  const Icon = isCritical ? AlertCircle : AlertTriangle;
  
  const bgColor = isCritical ? 'bg-error-500/20' : 'bg-warning-500/20';
  const textColor = isCritical ? 'text-error-400' : 'text-warning-400';
  const borderColor = isCritical ? 'border-error-500/30' : 'border-warning-500/30';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${borderColor} ${bgColor} ${textColor} text-xs font-medium transition-all duration-300 shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {activeViolations.length > 1 && (
        <span className="opacity-75 ml-1">+{activeViolations.length - 1}</span>
      )}
    </div>
  );
};
