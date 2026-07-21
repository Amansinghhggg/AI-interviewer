import { VoiceRecorder } from "./VoiceRecorder";

export const VoiceInputButton = ({ onTranscript, className }) => {
  return (
    <div className={`w-full ${className || ""}`}>
      <VoiceRecorder onTranscript={onTranscript} />
    </div>
  );
};
