import { useState } from "react";
import { Mic } from "lucide-react";
import toast from "react-hot-toast";

import { VoiceModal } from "./VoiceModal";
import { VoiceRecorder } from "./VoiceRecorder";

export const VoiceInputButton = ({ onTranscript, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTranscript = (transcript) => {
    toast.success("Voice successfully converted to text.");
    setIsModalOpen(false);
    
    if (onTranscript) {
      onTranscript(transcript);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`p-2 bg-dark-700 hover:bg-primary-600 text-dark-300 hover:text-white rounded-xl transition-colors shadow-sm ${className || ""}`}
        title="Record Answer"
        aria-label="Use voice typing"
      >
        <Mic className="w-5 h-5" />
      </button>

      <VoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-dark-50">Record your answer</h3>
            <p className="text-dark-300 text-sm mt-1">
              Speak clearly into your microphone.
            </p>
          </div>
          <VoiceRecorder onTranscript={handleTranscript} />
        </div>
      </VoiceModal>
    </>
  );
};
