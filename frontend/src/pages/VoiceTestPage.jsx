import { VoiceRecorder } from "../components/Voice";

const VoiceTestPage = () => {
  return (
    <div className="min-h-screen bg-dark-900 pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-dark-50 tracking-tight">Voice Module Test</h1>
          <p className="text-dark-300 mt-2">
            Standalone testing page for the Speech-to-Text backend pipeline.
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-8 rounded-2xl shadow-xl shadow-black/20">
          <VoiceRecorder />
        </div>
        
      </div>
    </div>
  );
};

export default VoiceTestPage;
