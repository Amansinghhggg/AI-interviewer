import React from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';

export const CandidateCard = () => {
    const { review } = useCandidateReview();
    
    if (!review) return null;
    const { candidate, interview } = review;

    return (
        <div className="widget candidate-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{candidate.name}</h2>
            <p style={{ margin: '5px 0' }}><strong>Position:</strong> {candidate.position}</p>
            <p style={{ margin: '5px 0' }}><strong>Status:</strong> {candidate.status}</p>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {interview.date ? new Date(interview.date).toLocaleDateString() : 'N/A'}</p>
            <p style={{ margin: '5px 0' }}><strong>Duration:</strong> {Math.floor(interview.duration / 60)}m {interview.duration % 60}s</p>
        </div>
    );
};
