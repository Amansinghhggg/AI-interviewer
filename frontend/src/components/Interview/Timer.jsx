import { Clock } from "lucide-react";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Timer = ({ timeLeft }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-dark-900 rounded-xl border border-dark-700">
      <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-danger-400 animate-pulse' : 'text-primary-400'}`} />
      <span className={`font-mono font-bold tracking-wider ${timeLeft < 60 ? 'text-danger-400' : 'text-dark-50'}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;
