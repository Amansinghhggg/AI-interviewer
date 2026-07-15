import { Loader2 } from "lucide-react";

export const VoiceLoading = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case "UPLOADING":
        return "Uploading audio...";
      case "TRANSCRIBING":
        return "Transcribing with AI...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-dark-800 border border-dark-700 rounded-xl">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
      <p className="text-dark-300 font-medium">{getStatusText()}</p>
      <p className="text-dark-500 text-sm mt-2 text-center">
        This usually takes just a few seconds.
      </p>
    </div>
  );
};
