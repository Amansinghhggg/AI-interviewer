import React from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { useEvaluationEngine } from '../../evaluation-engine/index.js';

export const InterviewOverviewWidget = () => {
    const { review } = useCandidateReview();
    const { evaluation } = useEvaluationEngine();

    if (!review) return null;
    const { interview, statistics } = review;

    return (
        <div className="widget overview-widget" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8em', color: '#666', textTransform: 'uppercase' }}>Interview Date</span>
                <strong style={{ fontSize: '1.2em', marginTop: '5px' }}>{interview.date ? new Date(interview.date).toLocaleDateString() : 'N/A'}</strong>
            </div>
            
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8em', color: '#666', textTransform: 'uppercase' }}>Duration</span>
                <strong style={{ fontSize: '1.2em', marginTop: '5px' }}>{Math.floor(statistics.totalDuration / 60)}m {statistics.totalDuration % 60}s</strong>
            </div>
            
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8em', color: '#666', textTransform: 'uppercase' }}>Questions</span>
                <strong style={{ fontSize: '1.2em', marginTop: '5px' }}>{statistics.totalQuestions}</strong>
            </div>

            <div style={{ background: evaluation ? '#e8f5e9' : '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8em', color: evaluation ? '#2e7d32' : '#666', textTransform: 'uppercase' }}>Recommendation</span>
                <strong style={{ fontSize: '1.1em', marginTop: '5px', color: evaluation ? '#2e7d32' : '#999', textAlign: 'center' }}>
                    {evaluation ? evaluation.recommendation : 'Pending AI'}
                </strong>
            </div>
            
            <div style={{ background: statistics.totalViolations > 0 ? '#ffebee' : '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8em', color: statistics.totalViolations > 0 ? '#c62828' : '#666', textTransform: 'uppercase' }}>Violations</span>
                <strong style={{ fontSize: '1.2em', marginTop: '5px', color: statistics.totalViolations > 0 ? '#c62828' : '#333' }}>{statistics.totalViolations}</strong>
            </div>
        </div>
    );
};
