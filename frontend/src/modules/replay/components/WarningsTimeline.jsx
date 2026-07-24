import React from 'react';
import { useReplay } from '../hooks/useReplay.js';
import { TIMELINE_EVENT_TYPES } from '../config/constants.js';

/**
 * Maps violation rule/type strings to human-readable labels and icons.
 */
const VIOLATION_META = {
    TAB_SWITCH:     { label: 'Tab Switch',     icon: '⇥', color: '#f59e0b' },
    PAGE_HIDDEN:    { label: 'Tab Switch',     icon: '⇥', color: '#f59e0b' },
    FACE_MISSING:   { label: 'Face Missing',   icon: '👤', color: '#ef4444' },
    NO_FACE:        { label: 'Face Missing',   icon: '👤', color: '#ef4444' },
    MULTIPLE_FACES: { label: 'Multiple Faces', icon: '👥', color: '#a855f7' },
    CAMERA_LOST:    { label: 'Camera Lost',    icon: '📷', color: '#ef4444' },
    CAMERA_OFFLINE: { label: 'Camera Lost',    icon: '📷', color: '#ef4444' },
    MIC_LOST:       { label: 'Mic Lost',       icon: '🎙️', color: '#f59e0b' },
    MICROPHONE_LOST:{ label: 'Mic Lost',       icon: '🎙️', color: '#f59e0b' },
};

const DEFAULT_META = { label: 'Violation', icon: '⚠️', color: '#f59e0b' };

function getMeta(ruleKey) {
    if (!ruleKey) return DEFAULT_META;
    const upper = String(ruleKey).toUpperCase().replace(/[\s-]/g, '_');
    return VIOLATION_META[upper] || DEFAULT_META;
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * WarningsTimeline
 *
 * Renders a list of violation timeline events from the replay session.
 * Clicking any entry seeks the ReplayPlayer to that timestamp.
 */
export const WarningsTimeline = () => {
    const { timeline, controls } = useReplay();

    const violations = timeline.filter((t) => t.type === TIMELINE_EVENT_TYPES.VIOLATION);

    if (violations.length === 0) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '13px',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
            }}>
                ✓ No violations detected during this interview.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {violations.map((v) => {
                const meta = getMeta(v.payload?.rule);
                const isCritical = v.payload?.severity === 'CRITICAL';

                return (
                    <button
                        key={v.id}
                        onClick={() => controls.seek(v.startTime)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid rgba(${isCritical ? '239,68,68' : '245,158,11'},0.2)`,
                            background: `rgba(${isCritical ? '239,68,68' : '245,158,11'},0.05)`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'background 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `rgba(${isCritical ? '239,68,68' : '245,158,11'},0.12)`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = `rgba(${isCritical ? '239,68,68' : '245,158,11'},0.05)`;
                        }}
                    >
                        {/* Icon */}
                        <span style={{ fontSize: '16px', flexShrink: 0, lineHeight: 1 }}>
                            {meta.icon}
                        </span>

                        {/* Label + message */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '2px',
                            }}>
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: meta.color,
                                }}>
                                    {meta.label}
                                </span>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)',
                                    color: isCritical ? '#f87171' : '#fbbf24',
                                }}>
                                    {v.payload?.severity || 'WARNING'}
                                </span>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.35)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {v.payload?.message || meta.label}
                            </p>
                        </div>

                        {/* Timestamp + seek icon */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexShrink: 0,
                        }}>
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.4)',
                            }}>
                                {formatTime(v.startTime)}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>▶</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
