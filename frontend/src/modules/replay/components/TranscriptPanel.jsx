import React, { useRef, useEffect } from 'react';
import { useReplay } from '../hooks/useReplay.js';
import { TIMELINE_EVENT_TYPES } from '../config/constants.js';

export const TranscriptPanel = () => {
    const { timeline, activeEntries } = useReplay();
    const panelRef = useRef(null);

    const questions = timeline.filter(t => t.type === TIMELINE_EVENT_TYPES.QUESTION);

    useEffect(() => {
        // Auto-scroll to the active question based on timeline sync
        const activeQuestion = activeEntries.find(e => e.type === TIMELINE_EVENT_TYPES.QUESTION);
        if (activeQuestion && panelRef.current) {
            const el = document.getElementById(`transcript-${activeQuestion.id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeEntries]);

    return (
        <div className="transcript-panel" ref={panelRef} style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Transcript</h3>
            {questions.length === 0 && <p>No transcript available.</p>}
            
            {questions.map(q => {
                const isActive = activeEntries.some(e => e.id === q.id);
                return (
                    <div 
                        key={q.id} 
                        id={`transcript-${q.id}`} 
                        style={{ 
                            padding: '10px', 
                            marginBottom: '10px', 
                            background: isActive ? '#e3f2fd' : '#fff', 
                            border: `1px solid ${isActive ? '#2196f3' : '#ddd'}`, 
                            borderRadius: '4px',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        <strong>Q{q.payload.index}: {q.payload.question}</strong>
                        <p style={{ margin: '8px 0 0 0', color: '#555' }}>
                            {q.payload.answer || 'No answer recorded.'}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};
