import React, { useRef, useEffect } from 'react';
import { VideoOff } from 'lucide-react';
import { useReplay } from '../hooks/useReplay.js';
import { REPLAY_STATES } from '../config/constants.js';

export const ReplayPlayer = () => {
    const { recording, state, playbackRate, controls, currentTime } = useReplay();
    const videoRef = useRef(null);

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

    if (!recording || !recording.url) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mb-4">
                    <VideoOff className="w-8 h-8 text-[var(--color-error)]" />
                </div>
                <h3 className="text-sm font-black text-[var(--color-on-surface)] uppercase tracking-widest mb-2">No Recording Available</h3>
                <p className="text-xs font-medium text-[var(--color-on-surface-variant)] max-w-md mx-auto leading-relaxed">
                    A video recording could not be found for this session. This usually happens if the candidate denied camera access, encountered a technical issue.
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
        <div className="replay-player rounded-xl overflow-hidden bg-black shadow-lg">
            <video
                ref={videoRef}
                src={recording.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => controls.updateTimeFromVideo(recording.duration || videoRef.current.duration)}
                className="replay-video w-full h-auto"
                controls={true}
                controlsList="nodownload"
                poster={recording.thumbnail}
            />
        </div>
    );
};
