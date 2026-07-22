import React from 'react';
import { useReplay } from '../hooks/useReplay.js';
import { TIMELINE_EVENT_TYPES } from '../config/constants.js';

export const ReplayTimeline = () => {
    const { recording, currentTime, timeline, controls } = useReplay();
    
    if (!recording) return null;
    const duration = recording.duration || 1; // avoid division by 0

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        controls.seek(percent * duration);
    };

    return (
        <div 
            className="replay-timeline" 
            style={{ position: 'relative', height: '30px', background: '#e0e0e0', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden' }} 
            onClick={handleSeek}
        >
            <div 
                className="replay-timeline-progress" 
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#4caf50', width: `${Math.min(100, (currentTime / duration) * 100)}%`, pointerEvents: 'none' }}
            />
            {timeline.map(entry => {
                const left = (entry.startTime / duration) * 100;
                let color = 'transparent';
                let zIndex = 1;

                if (entry.type === TIMELINE_EVENT_TYPES.QUESTION) {
                    color = '#2196f3'; // Blue
                } else if (entry.type === TIMELINE_EVENT_TYPES.VIOLATION) {
                    color = '#f44336'; // Red
                    zIndex = 2;
                } else if (entry.type === TIMELINE_EVENT_TYPES.MONITORING) {
                    color = '#ff9800'; // Orange
                }

                if (color === 'transparent') return null;

                return (
                    <div 
                        key={entry.id}
                        title={entry.type}
                        style={{
                            position: 'absolute',
                            left: `${left}%`,
                            top: 0,
                            height: '100%',
                            width: '4px',
                            background: color,
                            zIndex,
                            pointerEvents: 'none'
                        }}
                    />
                );
            })}
        </div>
    );
};
