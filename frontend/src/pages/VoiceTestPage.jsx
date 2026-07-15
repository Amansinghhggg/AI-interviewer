import { useState, useEffect } from "react";
import { VoiceRecorder } from "../components/Voice";
import { voiceService } from "../services/voice.service";
import { Loader2, RefreshCcw, WifiOff, CheckCircle2 } from "lucide-react";

const VoiceTestPage = () => {
  const [healthStatus, setHealthStatus] = useState("checking"); // 'checking' | 'online' | 'offline'

  const checkHealth = async () => {
    setHealthStatus("checking");
    try {
      const res = await voiceService.health();
      if (res.status === "ok") {
        setHealthStatus("online");
      } else {
        setHealthStatus("offline");
      }
    } catch (err) {
      setHealthStatus("offline");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-50 tracking-tight">Voice Module Test</h1>
          <p className="text-dark-300 mt-2">
            Standalone testing page for the Speech-to-Text backend pipeline.
          </p>
        </div>

        {/* Health Check Status */}
        <div className="max-w-2xl mx-auto mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full shadow-sm">
            {healthStatus === "checking" && (
              <>
                <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                <span className="text-dark-300 text-sm font-medium">Checking Service Status...</span>
              </>
            )}
            {healthStatus === "online" && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-400 text-sm font-medium">Voice Service Ready</span>
              </>
            )}
            {healthStatus === "offline" && (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-400 text-sm font-medium">Voice Service Offline</span>
                <button 
                  onClick={checkHealth}
                  className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs rounded-md transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Retry Connection
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-8 rounded-2xl shadow-xl shadow-black/20">
          <VoiceRecorder />
        </div>
        
      </div>
    </div>
  );
};

export default VoiceTestPage;
