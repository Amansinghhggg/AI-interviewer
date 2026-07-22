import React from 'react';
import { useReplay } from '../hooks/useReplay.js';
import { REPLAY_STATES } from '../config/constants.js';

export const ReplayControls = () => {
    const { state, controls, playbackRate } = useReplay();

    const isPlaying = state === REPLAY_STATES.PLAYING;

    return (
        <div className="replay-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px' }}>
            <button 
                onClick={isPlaying ? controls.pause : controls.play}
                disabled={state === REPLAY_STATES.IDLE || state === REPLAY_STATES.LOADING}
            >
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <select 
                value={playbackRate} 
                onChange={(e) => controls.changeSpeed(parseFloat(e.target.value))}
            >
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2x</option>
            </select>
        </div>
    );
};
