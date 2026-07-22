import { useState, useEffect, useCallback } from 'react';
import { replayEngine } from '../services/ReplayEngine.js';

export function useReplay() {
    const playbackEngine = replayEngine.getPlaybackEngine();
    const synchronizer = replayEngine.getSynchronizer();

    const [state, setState] = useState(playbackEngine.state);
    const [currentTime, setCurrentTime] = useState(playbackEngine.currentTime);
    const [playbackRate, setPlaybackRate] = useState(playbackEngine.playbackRate);
    const [activeEntries, setActiveEntries] = useState(synchronizer.getActiveTimelineEntries());
    
    useEffect(() => {
        const handleStateChange = (newState) => setState(newState);
        const handleTimeUpdate = (newTime) => {
            setCurrentTime(newTime);
            setActiveEntries(synchronizer.getActiveTimelineEntries());
        };
        const handleRateChange = (newRate) => setPlaybackRate(newRate);

        playbackEngine.on('statechange', handleStateChange);
        playbackEngine.on('timeupdate', handleTimeUpdate);
        playbackEngine.on('ratechange', handleRateChange);
        
        // Setup initial state on mount
        setState(playbackEngine.state);
        setCurrentTime(playbackEngine.currentTime);
        setActiveEntries(synchronizer.getActiveTimelineEntries());

        return () => {
            playbackEngine.off('statechange', handleStateChange);
            playbackEngine.off('timeupdate', handleTimeUpdate);
            playbackEngine.off('ratechange', handleRateChange);
        };
    }, [playbackEngine, synchronizer]);

    const play = useCallback(() => playbackEngine.play(), [playbackEngine]);
    const pause = useCallback(() => playbackEngine.pause(), [playbackEngine]);
    const seek = useCallback((time) => playbackEngine.seek(time), [playbackEngine]);
    const changeSpeed = useCallback((speed) => playbackEngine.changeSpeed(speed), [playbackEngine]);
    
    const updateTimeFromVideo = useCallback((time) => playbackEngine.updateTime(time), [playbackEngine]);

    return {
        state,
        currentTime,
        playbackRate,
        timeline: replayEngine.getTimeline(),
        activeEntries,
        recording: replayEngine.getRecording(),
        controls: {
            play,
            pause,
            seek,
            changeSpeed,
            updateTimeFromVideo
        }
    };
}
