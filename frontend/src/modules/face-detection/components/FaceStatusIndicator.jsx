import { ScanFace, UserX, Users } from 'lucide-react';
import { FACE_STATES } from '../utils/faceDetection.states';

export const FaceStatusIndicator = ({ snapshot }) => {
  if (!snapshot || snapshot.status === FACE_STATES.INITIALIZING || snapshot.status === FACE_STATES.ONE_FACE) {
    // Hide when healthy (ONE_FACE) or initializing to avoid UI clutter
    return null;
  }

  const { status } = snapshot;

  let bgColor = 'bg-dark-800/80';
  let textColor = 'text-dark-50';
  let borderColor = 'border-dark-700/50';
  let Icon = ScanFace;
  let text = 'Face Detected';

  if (status === FACE_STATES.NO_FACE) {
    bgColor = 'bg-warning-500/20';
    textColor = 'text-warning-400';
    borderColor = 'border-warning-500/30';
    Icon = UserX;
    text = 'No Face';
  } else if (status === FACE_STATES.MULTIPLE_FACES) {
    bgColor = 'bg-warning-500/20';
    textColor = 'text-warning-400';
    borderColor = 'border-warning-500/30';
    Icon = Users;
    text = 'Multiple Faces';
  } else if (status === FACE_STATES.ERROR) {
    bgColor = 'bg-error-500/20';
    textColor = 'text-error-400';
    borderColor = 'border-error-500/30';
    Icon = UserX;
    text = 'Detection Error';
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${borderColor} ${bgColor} ${textColor} text-xs font-medium transition-all duration-300 shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
};
