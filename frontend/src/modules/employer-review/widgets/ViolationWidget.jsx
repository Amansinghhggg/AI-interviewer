import React from 'react';
import { useEmployerReview } from '../hooks/useEmployerReview.js';

export const ViolationWidget = () => {
    const { review } = useEmployerReview();
    
    if (!review || !review.violations) return null;

    return (
        <div className="widget violation-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Violations</h3>
            {review.violations.length === 0 ? (
                <p style={{ color: '#555' }}>No violations detected.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {review.violations.map((v, i) => (
                        <li key={i} style={{ padding: '12px', marginBottom: '8px', borderLeft: `4px solid ${v.severity === 'CRITICAL' ? '#f44336' : '#ff9800'}`, background: '#f9f9f9', borderRadius: '0 4px 4px 0' }}>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>{v.rule}</strong>
                            <span style={{ fontSize: '0.9em', color: '#555' }}>{v.message}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
