import { VoiceRecorder } from "./VoiceRecorder";

export const VoiceInputButton = ({ 
  isListening, 
  isAutomaticMode, 
  isTranscribing, 
  onRecordingComplete, 
  className 
}) => {
  return (
    <div className={`w-full ${className || ""}`}>
      <VoiceRecorder 
        isListening={isListening}
        isAutomaticMode={isAutomaticMode}
        isTranscribing={isTranscribing}
        onRecordingComplete={onRecordingComplete}
      />
    </div>
  );
};
