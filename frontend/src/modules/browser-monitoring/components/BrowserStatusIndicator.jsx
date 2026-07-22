import { EyeOff, MousePointerClick, WifiOff } from 'lucide-react';
import { BROWSER_STATES } from '../utils/browserMonitoring.states';

export const BrowserStatusIndicator = ({ status }) => {
  if (!status || status === BROWSER_STATES.ACTIVE || status === BROWSER_STATES.FULLSCREEN) {
    return null; // Hidden during normal operation
  }

  let bgColor = 'bg-dark-800/80';
  let textColor = 'text-dark-50';
  let borderColor = 'border-dark-700/50';
  let Icon = EyeOff;
  let text = 'Browser Status';

  if (status === BROWSER_STATES.OFFLINE) {
    bgColor = 'bg-error-500/20';
    textColor = 'text-error-400';
    borderColor = 'border-error-500/30';
    Icon = WifiOff;
    text = 'Offline';
  } else if (status === BROWSER_STATES.BACKGROUND) {
    bgColor = 'bg-warning-500/20';
    textColor = 'text-warning-400';
    borderColor = 'border-warning-500/30';
    Icon = EyeOff;
    text = 'Interview Tab Hidden';
  } else if (status === BROWSER_STATES.UNFOCUSED) {
    bgColor = 'bg-warning-500/10';
    textColor = 'text-warning-500';
    borderColor = 'border-warning-500/30';
    Icon = MousePointerClick;
    text = 'Browser Not Focused';
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${borderColor} ${bgColor} ${textColor} text-xs font-medium transition-all duration-300 shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
};
