import { AlertTriangle, Info } from 'lucide-react';
import { DEVICE_HEALTH_STATES } from '../utils/deviceHealth.states';

export const DeviceHealthIndicator = ({ snapshot }) => {
  if (!snapshot || snapshot.overall === DEVICE_HEALTH_STATES.HEALTHY || snapshot.overall === DEVICE_HEALTH_STATES.INITIALIZING) {
    return null;
  }

  const { overall, issues } = snapshot;

  let bgColor = 'bg-dark-800/80';
  let textColor = 'text-dark-50';
  let borderColor = 'border-dark-700/50';
  let Icon = Info;

  if (overall === DEVICE_HEALTH_STATES.ERROR) {
    bgColor = 'bg-error-500/20';
    textColor = 'text-error-400';
    borderColor = 'border-error-500/30';
    Icon = AlertTriangle;
  } else if (overall === DEVICE_HEALTH_STATES.WARNING || overall === DEVICE_HEALTH_STATES.DISCONNECTED || overall === DEVICE_HEALTH_STATES.RECOVERING) {
    bgColor = 'bg-warning-500/20';
    textColor = 'text-warning-400';
    borderColor = 'border-warning-500/30';
    Icon = AlertTriangle;
  }

  // Display the first issue, formatted nicely
  const issueText = issues.length > 0 ? issues[0].replace(/_/g, ' ') : 'Device issue detected';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${borderColor} ${bgColor} ${textColor} text-xs font-medium transition-all duration-300 shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{issueText.toLowerCase()}</span>
    </div>
  );
};
