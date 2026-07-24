import React from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';

export const StatisticsWidget = () => {
    const { review } = useCandidateReview();
    
    if (!review || !review.statistics) return null;
    const { statistics } = review;

    return (
        <div className="widget statistics-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase' }}>Questions</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{statistics.totalQuestions}</div>
                </div>
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase' }}>Duration</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{Math.floor(statistics.totalDuration / 60)}m {statistics.totalDuration % 60}s</div>
                </div>
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase' }}>Violations</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{statistics.totalViolations}</div>
                </div>
                <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '4px', color: '#e65100' }}>
                    <div style={{ fontSize: '0.85em', textTransform: 'uppercase' }}>Warnings</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{statistics.warningCount}</div>
                </div>
                <div style={{ background: '#ffebee', padding: '10px', borderRadius: '4px', color: '#c62828', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.85em', textTransform: 'uppercase' }}>Critical</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{statistics.criticalCount}</div>
                </div>
            </div>
        </div>
    );
};
