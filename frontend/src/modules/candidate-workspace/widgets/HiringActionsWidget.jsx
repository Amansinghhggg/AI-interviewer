import React from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { CANDIDATE_STATUSES } from '../config/constants.js';

export const HiringActionsWidget = () => {
    const { actions } = useCandidateReview();

    return (
        <div className="widget hiring-actions-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Hiring Decisions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                    onClick={() => actions.updateStatus(CANDIDATE_STATUSES.HIRED)}
                    style={{ padding: '10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hire</button>
                <button 
                    onClick={() => actions.updateStatus(CANDIDATE_STATUSES.NEXT_ROUND)}
                    style={{ padding: '10px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Next Round</button>
                <button 
                    onClick={() => actions.updateStatus(CANDIDATE_STATUSES.SHORTLISTED)}
                    style={{ padding: '10px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Shortlist</button>
                <button 
                    onClick={() => actions.updateStatus(CANDIDATE_STATUSES.REJECTED)}
                    style={{ padding: '10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
            </div>
            <button 
                onClick={() => actions.resetStatus()}
                style={{ width: '100%', padding: '8px', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Reset Status</button>
        </div>
    );
};
