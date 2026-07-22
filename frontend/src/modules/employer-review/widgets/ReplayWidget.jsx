import React from 'react';
import { ReplayPlayer, ReplayTimeline, ReplayControls } from '../../replay/index.js';

export const ReplayWidget = () => {
    return (
        <div className="widget replay-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <ReplayPlayer />
            <ReplayTimeline />
            <ReplayControls />
        </div>
    );
};
