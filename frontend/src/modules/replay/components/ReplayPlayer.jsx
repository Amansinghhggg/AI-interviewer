import React, { useRef, useEffect, useState } from 'react';
import { VideoOff, Play, Pause, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react';
import { useReplay } from '../hooks/useReplay.js';
import { REPLAY_STATES, TIMELINE_EVENT_TYPES } from '../config/constants.js';

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ReplayPlayer = () => {
    const { recording, state, playbackRate, controls, currentTime, timeline } = useReplay();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hasShownFullscreenToastRef = useRef(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenNotice, setShowFullscreenNotice] = useState(false);

    const questions = timeline?.filter((t) => t.type === TIMELINE_EVENT_TYPES.QUESTION) || [];
    const violations = timeline?.filter((t) => t.type === TIMELINE_EVENT_TYPES.VIOLATION) || [];

    const duration = recording?.duration || (videoRef.current ? videoRef.current.duration : 0) || 1;

    // Listen to Fullscreen changes & show in-player overlay notice inside the fullscreen container
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);

            if (isFull && !hasShownFullscreenToastRef.current) {
                hasShownFullscreenToastRef.current = true;
                setShowFullscreenNotice(true);

                const timer = setTimeout(() => {
                    setShowFullscreenNotice(false);
                }, 10000);
                return () => clearTimeout(timer);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Sync play/pause state
    useEffect(() => {
        if (!videoRef.current) return;
        if (state === REPLAY_STATES.PLAYING) {
            videoRef.current.play().catch(e => console.error("Playback prevented", e));
        } else if (state === REPLAY_STATES.PAUSED || state === REPLAY_STATES.IDLE || state === REPLAY_STATES.ENDED) {
            videoRef.current.pause();
        }
    }, [state]);

    // Sync playback rate
    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    // Sync current time when driven externally (e.g. seeking via timeline)
    useEffect(() => {
        if (!videoRef.current) return;
        if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
            videoRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

    const handleTimeUpdate = () => {
        if (videoRef.current && state === REPLAY_STATES.PLAYING) {
            controls.updateTimeFromVideo(videoRef.current.currentTime);
        }
    };

    const togglePlay = () => {
        if (state === REPLAY_STATES.PLAYING) {
            controls.pause();
        } else {
            controls.play();
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        const target = containerRef.current || videoRef.current;
        if (target) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            } else {
                target.requestFullscreen().catch(err => console.error(err));
            }
        }
    };

    const handleScrubClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        controls.seek(percent * duration);
    };

    if (!recording || !recording.url) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mb-4">
                    <VideoOff className="w-8 h-8 text-[var(--color-error)]" />
                </div>
                <h3 className="text-sm font-black text-[var(--color-on-surface)] uppercase tracking-widest mb-2">No Recording Available</h3>
                <p className="text-xs font-medium text-[var(--color-on-surface-variant)] max-w-md mx-auto leading-relaxed">
                    A video recording could not be found for this session. This usually happens if the candidate denied camera access or encountered a technical issue.
                </p>
                <div className="mt-6 px-5 py-3 bg-[var(--color-surface-container)] rounded-xl border border-[var(--color-outline-variant)]/50">
                    <p className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">
                        Tip: You can re-enroll this candidate to have them take the interview again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`replay-player bg-black shadow-xl relative group flex flex-col transition-all ${isFullscreen
                ? 'fixed inset-0 z-[99999] w-screen h-screen justify-between rounded-none border-0'
                : 'rounded-xl overflow-hidden border border-slate-800'
                }`}
        >
            {/* In-Player Overlay Guidance Notice for Fullscreen Preview */}
            {showFullscreenNotice && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-purple-500/40 text-slate-100 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-[90vw] transition-all">
                    <span className="text-base shrink-0">💡</span>
                    <span className="leading-snug">Hover over the blue markers on the playback bar to preview questions & jump to exact timestamps.</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowFullscreenNotice(false); }}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 ml-1"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div
                className={`relative cursor-pointer bg-black flex items-center justify-center ${isFullscreen ? 'flex-1 w-full h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[220px]'
                    }`}
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src={recording.url}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => controls.updateTimeFromVideo(duration)}
                    className={`replay-video w-full object-contain mx-auto block ${isFullscreen ? 'h-full max-h-none' : 'h-auto max-h-[460px]'
                        }`}
                    controls={false}
                    poster={recording.thumbnail}
                />
                {state !== REPLAY_STATES.PLAYING && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all z-20">
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                            title="Play Video"
                        >
                            <Play className="w-7 h-7 fill-current ml-1" />
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Interactive Playback Bar */}
            <div className={`bg-slate-900/95 border-t border-slate-800 p-3 px-4 flex flex-col gap-2.5 select-none ${isFullscreen ? 'sticky bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md shrink-0 py-4' : ''
                }`}>
                {/* Scrub Bar */}
                <div
                    className="relative h-2.5 bg-slate-800 rounded-full cursor-pointer group/scrub flex items-center"
                    onClick={handleScrubClick}
                >
                    {/* Progress Fill */}
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full pointer-events-none transition-all duration-75"
                        style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                    />

                    {/* Scrub Handle / Knob */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-400 border-2 border-slate-900 shadow-md transition-transform scale-0 group-hover/scrub:scale-100 pointer-events-none"
                        style={{ left: `calc(${Math.min(100, (currentTime / duration) * 100)}% - 8px)` }}
                    />

                    {/* Question Markers */}
                    {questions.map((q) => (
                        <div
                            key={q.id}
                            onClick={(e) => { e.stopPropagation(); controls.seek(q.startTime); }}
                            title={`Q${q.payload?.index || ''}: ${q.payload?.question || ''}`}
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-400 border border-slate-900 cursor-pointer hover:scale-150 transition-transform z-10"
                            style={{ left: `calc(${Math.min(100, (q.startTime / duration) * 100)}% - 6px)` }}
                        />
                    ))}

                    {/* Violation Markers */}
                    {violations.map((v) => (
                        <div
                            key={v.id}
                            onClick={(e) => { e.stopPropagation(); controls.seek(v.startTime); }}
                            title={v.payload?.rule || 'Warning'}
                            className="absolute top-0 bottom-0 w-1 bg-red-500 rounded cursor-pointer hover:w-1.5 transition-all z-10"
                            style={{ left: `calc(${Math.min(100, (v.startTime / duration) * 100)}% - 2px)` }}
                        />
                    ))}
                </div>

                {/* Controls Toolbar */}
                <div className="flex items-center justify-between text-slate-200">
                    {/* Left Section: Play/Pause, Mute, Time */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                            title={state === REPLAY_STATES.PLAYING ? 'Pause' : 'Play'}
                        >
                            {state === REPLAY_STATES.PLAYING ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 fill-current" />
                            )}
                        </button>

                        <button
                            onClick={toggleMute}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? (
                                <VolumeX className="w-5 h-5 text-red-400" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </button>

                        <span className="text-xs sm:text-sm font-mono text-slate-400 font-semibold">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Section: Speed, Fullscreen */}
                    <div className="flex items-center gap-3">
                        {/* Speed Dropdown */}
                        <div className="flex items-center gap-1.5 text-xs">
                            <select
                                value={playbackRate}
                                onChange={(e) => controls.changeSpeed(parseFloat(e.target.value))}
                                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value={0.5}>0.5x</option>
                                <option value={1.0}>1.0x</option>
                                <option value={1.25}>1.25x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2.0}>2.0x</option>
                            </select>
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                            ) : (
                                <Maximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

