import React, { useRef, useEffect } from 'react';
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
        return <div className="replay-player-placeholder">No recording available</div>;
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
