import { useState } from "react";
import { VoicePlayer } from "./VoicePlayer";
import { voiceService } from "../../services/voice.service";
import { Loader2, Mic } from "lucide-react";
import toast from "react-hot-toast";

const AVAILABLE_VOICES = [
  { id: "en-US-AriaNeural", name: "Aria (Female)" },
  { id: "en-US-JennyNeural", name: "Jenny (Female)" },
  { id: "en-US-GuyNeural", name: "Guy (Male)" }
];

export const VoiceSpeakTest = () => {
  const [text, setText] = useState("Hello! I am ready for the interview.");
  const [voice, setVoice] = useState(AVAILABLE_VOICES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text.");
      return;
    }

    setIsGenerating(true);
    setAudioBlob(null);

    try {
      const response = await voiceService.speak(text, voice);
      setAudioBlob(response.blob);
      toast.success("Speech generated!");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to generate speech.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Voice Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-dark-300 font-medium">Select Voice</label>
        <select 
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="bg-dark-800 border border-dark-700 text-dark-100 p-2.5 rounded-lg focus:border-primary-500 outline-none"
        >
          {AVAILABLE_VOICES.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
          <option value="invalid-voice">Mock Invalid Voice (Error Test)</option>
        </select>
      </div>

      {/* Text Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-dark-300 font-medium">Text to Synthesize</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="bg-dark-800 border border-dark-700 rounded-xl p-4 text-dark-50 placeholder-dark-400 min-h-[120px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-y"
          maxLength={500}
        />
        <div className="text-xs text-dark-400 text-right">
          {text.length} / 500
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !text.trim()}
        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors ${
          isGenerating || !text.trim()
            ? "bg-dark-700 text-dark-400 cursor-not-allowed"
            : "bg-primary-600 hover:bg-primary-500 text-white"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Generate Speech
          </>
        )}
      </button>

      {audioBlob && (
        <div className="mt-4 border-t border-dark-800 pt-6">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Playback</h3>
          <VoicePlayer audioBlob={audioBlob} />
        </div>
      )}

    </div>
  );
};
