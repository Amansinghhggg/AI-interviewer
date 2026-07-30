import React, { useState, useEffect } from 'react';
import AvatarPlayer from '../../components/AvatarPlayer';
import { Mic, MicOff, Play, Pause, Volume2, Sparkles, Monitor, Layout, CheckCircle2, Brain, Radio } from 'lucide-react';

export default function AvatarTestPage() {
  const [mode, setMode] = useState('listening');
  const [aspectRatio, setAspectRatio] = useState('16 / 9');
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [readyStatus, setReadyStatus] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const handleSetMode = (newMode) => {
    setMode(newMode);
    addLog(`Mode changed -> ${newMode}`);
  };

  // Auto simulation loop through Listening -> Thinking -> Speaking
  useEffect(() => {
    if (!autoSimulate) return;
    addLog('Automated 3-state simulation started');

    const modes = ['listening', 'thinking', 'speaking'];
    let idx = 0;

    const interval = setInterval(() => {
      idx = (idx + 1) % modes.length;
      const nextMode = modes[idx];
      setMode(nextMode);
      addLog(`[Auto Sim] Mode -> ${nextMode}`);
    }, 2500);

    return () => {
      clearInterval(interval);
      addLog('Automated simulation stopped');
    };
  }, [autoSimulate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Enterprise AI Interview Suite
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">AI Interview Avatar Player</h1>
            <p className="text-slate-400 text-sm mt-1">
              3-State Flow: <strong>Talking</strong> (audio on, talking.mp4) | <strong>Listening</strong> (idle.mp4) | <strong>Thinking</strong> (still.jpg)
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {readyStatus ? 'Assets Preloaded & Ready' : 'Buffering Media Assets...'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Avatar Stage */}
          <main className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2 backdrop-blur shadow-2xl">
              <AvatarPlayer
                mode={mode}
                aspectRatio={aspectRatio}
                showStatusBadge={showBadge}
                onReady={() => {
                  setReadyStatus(true);
                  addLog('All media assets (idle.mp4, talking.mp4, still.jpg) preloaded');
                }}
                onError={(err) => {
                  addLog(`Error: ${err.message}`);
                }}
              />
            </div>

            {/* Stage Quick Mode Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSetMode('speaking')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                    mode === 'speaking'
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Volume2 className="w-4 h-4" /> 1. Audio ON (talking.mp4)
                </button>

                <button
                  onClick={() => handleSetMode('listening')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                    mode === 'listening' || mode === 'idle'
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Radio className="w-4 h-4" /> 2. Listening (idle.mp4)
                </button>

                <button
                  onClick={() => handleSetMode('thinking')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                    mode === 'thinking'
                      ? 'bg-purple-600 text-white shadow-purple-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Brain className="w-4 h-4" /> 3. Thinking (still.jpg)
                </button>
              </div>

              <button
                onClick={() => setAutoSimulate((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium border text-xs transition-all ${
                  autoSimulate
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {autoSimulate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {autoSimulate ? 'Pause Auto Loop' : 'Auto 3-State Loop'}
              </button>
            </div>
          </main>

          {/* Sidebar Controls & Telemetry */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Control Panel Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-400" /> Layout & Settings
              </h2>

              {/* Aspect Ratio Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {['16 / 9', '4 / 3', '1 / 1'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => {
                        setAspectRatio(ratio);
                        addLog(`Aspect ratio set to ${ratio}`);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        aspectRatio === ratio
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Badge Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-medium text-slate-300">Show Status Overlay Badge</span>
                <button
                  onClick={() => setShowBadge((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    showBadge ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showBadge ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Event Logs */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transition Log</h3>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              </div>
              <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-slate-400">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">No events logged yet...</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-snug text-slate-300 border-b border-slate-900/50 pb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Flow Summary Card */}
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 text-xs space-y-2 text-indigo-200">
              <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" /> Specified Flow Rules
              </h4>
              <ul className="space-y-1 text-indigo-300/80">
                <li>• <strong>Audio ON / Speaking</strong>: <code>talking.mp4</code></li>
                <li>• <strong>Listening / Idle</strong>: <code>idle.mp4</code></li>
                <li>• <strong>Thinking / Processing</strong>: <code>still.jpg</code></li>
              </ul>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
