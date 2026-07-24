import React from 'react';
import { useReplay } from '../hooks/useReplay.js';
import { TIMELINE_EVENT_TYPES } from '../config/constants.js';

/**
 * Formats seconds into MM:SS display string.
 */
function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ReplayTimeline = () => {
    const { recording, currentTime, timeline, activeEntries, controls } = useReplay();

    if (!recording) return null;
    const duration = recording.duration || 1;

    const questions = timeline.filter((t) => t.type === TIMELINE_EVENT_TYPES.QUESTION);
    const violations = timeline.filter((t) => t.type === TIMELINE_EVENT_TYPES.VIOLATION);

    const handleScrubClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        controls.seek(percent * duration);
    };

    const activeQuestionId = activeEntries.find(
        (e) => e.type === TIMELINE_EVENT_TYPES.QUESTION
    )?.id;

    return (
        <div className="replay-timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Scrub Bar ── */}
            <div
                style={{
                    position: 'relative',
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    overflow: 'visible',
                }}
                onClick={handleScrubClick}
            >
                {/* Progress fill */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                        width: `${Math.min(100, (currentTime / duration) * 100)}%`,
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        transition: 'width 0.1s linear',
                    }}
                />

                {/* Playhead */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${Math.min(100, (currentTime / duration) * 100)}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#a855f7',
                        boxShadow: '0 0 0 3px rgba(168,85,247,0.3)',
                        pointerEvents: 'none',
                        zIndex: 3,
                    }}
                />

                {/* Question markers on scrub bar */}
                {questions.map((q) => (
                    <div
                        key={q.id}
                        onClick={(e) => { e.stopPropagation(); controls.seek(q.startTime); }}
                        title={`Q${q.payload.index}: ${q.payload.question}`}
                        style={{
                            position: 'absolute',
                            left: `${(q.startTime / duration) * 100}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#60a5fa',
                            border: '2px solid #1e3a5f',
                            zIndex: 2,
                            cursor: 'pointer',
                        }}
                    />
                ))}

                {/* Violation markers on scrub bar */}
                {violations.map((v) => (
                    <div
                        key={v.id}
                        onClick={(e) => { e.stopPropagation(); controls.seek(v.startTime); }}
                        title={v.payload?.rule || 'Violation'}
                        style={{
                            position: 'absolute',
                            left: `${(v.startTime / duration) * 100}%`,
                            top: 0,
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '100%',
                            background: '#ef4444',
                            zIndex: 2,
                            cursor: 'pointer',
                            borderRadius: '2px',
                        }}
                    />
                ))}
            </div>

            {/* ── Question Markers List ── */}
            {questions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        Questions
                    </p>
                    {questions.map((q) => {
                        const isActive = q.id === activeQuestionId;
                        return (
                            <button
                                key={q.id}
                                onClick={() => controls.seek(q.startTime)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${isActive ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.06)'}`,
                                    background: isActive ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    width: '100%',
                                }}
                            >
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                                    fontWeight: 700,
                                    minWidth: '42px',
                                    flexShrink: 0,
                                }}>
                                    {formatTime(q.startTime)}
                                </span>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isActive ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                    flexShrink: 0,
                                    transition: 'background 0.2s',
                                }} />
                                <span style={{
                                    fontSize: '13px',
                                    color: isActive ? '#e2e8f0' : 'rgba(255,255,255,0.55)',
                                    fontWeight: isActive ? 600 : 400,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    transition: 'color 0.2s',
                                }}>
                                    Question {q.payload.index}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
