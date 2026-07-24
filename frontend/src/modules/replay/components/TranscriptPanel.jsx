import React, { useRef, useEffect } from 'react';
import { useReplay } from '../hooks/useReplay.js';
import { TIMELINE_EVENT_TYPES } from '../config/constants.js';

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const TranscriptPanel = () => {
    const { timeline, activeEntries, controls } = useReplay();
    const panelRef = useRef(null);
    const lastActiveIdRef = useRef(null);

    const questions = timeline.filter((t) => t.type === TIMELINE_EVENT_TYPES.QUESTION);
    const activeQuestion = activeEntries.find((e) => e.type === TIMELINE_EVENT_TYPES.QUESTION);
    const activeId = activeQuestion?.id || null;

    // Auto-scroll only when the active question ID changes
    useEffect(() => {
        if (!activeId || activeId === lastActiveIdRef.current) return;
        lastActiveIdRef.current = activeId;

        const el = document.getElementById(`transcript-q-${activeId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [activeId]);

    if (questions.length === 0) {
        return (
            <div style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center' }}>
                No transcript available.
            </div>
        );
    }

    return (
        <div
            className="transcript-panel"
            ref={panelRef}
            style={{
                maxHeight: '480px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}
        >
            {questions.map((q) => {
                const isActive = q.id === activeId;
                const question = q.payload.question || q.payload.text || '';
                const answer = q.payload.answer || null;

                return (
                    <div
                        key={q.id}
                        id={`transcript-q-${q.id}`}
                        onClick={() => controls.seek(q.startTime)}
                        style={{
                            padding: '14px 16px',
                            borderRadius: '10px',
                            border: `1px solid ${isActive ? 'rgba(96,165,250,0.6)' : 'rgba(255,255,255,0.07)'}`,
                            background: isActive
                                ? 'rgba(96,165,250,0.08)'
                                : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            transition: 'border-color 0.25s, background 0.25s',
                            boxShadow: isActive ? '0 0 0 1px rgba(96,165,250,0.2)' : 'none',
                        }}
                    >
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            {/* Index badge */}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#fff',
                                flexShrink: 0,
                                transition: 'background 0.25s',
                            }}>
                                {q.payload.index}
                            </span>

                            {/* Timestamp */}
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                                fontWeight: 600,
                                transition: 'color 0.25s',
                            }}>
                                {formatTime(q.startTime)}
                            </span>

                            {isActive && (
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#60a5fa',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                    Now Playing
                                </span>
                            )}
                        </div>

                        {/* Question text */}
                        <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: isActive ? '#e2e8f0' : 'rgba(255,255,255,0.7)',
                            lineHeight: 1.5,
                            transition: 'color 0.25s',
                        }}>
                            {question}
                        </p>

                        {/* Answer */}
                        {answer && (
                            <p style={{
                                margin: 0,
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.45)',
                                lineHeight: 1.6,
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                paddingTop: '8px',
                            }}>
                                {answer}
                            </p>
                        )}

                        {!answer && (
                            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                                No answer recorded.
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
