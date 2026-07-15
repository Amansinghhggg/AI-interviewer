import { useState, useEffect } from "react";
import { Copy, Edit2, Check, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export const VoiceTranscript = ({ transcript, onTranscriptChange, onReset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTranscript, setLocalTranscript] = useState(transcript);

  // Sync if parent updates it
  useEffect(() => {
    setLocalTranscript(transcript);
  }, [transcript]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localTranscript);
    toast.success("Transcript copied to clipboard");
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onTranscriptChange) {
      onTranscriptChange(localTranscript);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4 bg-dark-800 border border-dark-700 rounded-xl p-5">
      <div className="flex justify-between items-center border-b border-dark-700 pb-3">
        <h3 className="text-dark-100 font-medium">Transcript</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-md transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-md transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <textarea
          value={localTranscript}
          onChange={(e) => setLocalTranscript(e.target.value)}
          className="w-full min-h-[120px] bg-dark-900 border border-dark-700 rounded-lg p-3 text-dark-200 focus:outline-none focus:border-primary-500 transition-colors resize-y"
          placeholder="Edit your transcript here..."
        />
      ) : (
        <div className="min-h-[120px] p-3 text-dark-200 whitespace-pre-wrap leading-relaxed">
          {localTranscript || <span className="text-dark-500 italic">No transcript available.</span>}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-lg transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Record Again
        </button>
      </div>
    </div>
  );
};
