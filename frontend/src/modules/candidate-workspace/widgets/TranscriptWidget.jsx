import React from 'react';
import { TranscriptPanel } from '../../replay/index.js';

export const TranscriptWidget = () => {
    return (
        <div className="widget transcript-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <TranscriptPanel />
        </div>
    );
};
