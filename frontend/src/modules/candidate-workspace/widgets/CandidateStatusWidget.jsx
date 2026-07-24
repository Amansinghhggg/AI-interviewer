import React from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';

export const CandidateStatusWidget = () => {
    const { hiringStatus } = useCandidateReview();

    const getStatusColor = (status) => {
        if (status === 'HIRED') return '#e8f5e9';
        if (status === 'REJECTED') return '#ffebee';
        if (status === 'SHORTLISTED' || status === 'NEXT_ROUND') return '#e3f2fd';
        return '#f5f5f5';
    };

    const getTextColor = (status) => {
        if (status === 'HIRED') return '#2e7d32'; 
        if (status === 'REJECTED') return '#c62828';
        if (status === 'SHORTLISTED' || status === 'NEXT_ROUND') return '#1565c0';
        return '#424242';
    };

    return (
        <div className="widget status-widget" style={{ padding: '15px 20px', background: getStatusColor(hiringStatus), border: `1px solid ${getTextColor(hiringStatus)}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: getTextColor(hiringStatus), fontSize: '1.1em' }}>Current Status:</strong>
            <span style={{ fontWeight: 'bold', fontSize: '1.1em', color: getTextColor(hiringStatus), padding: '4px 12px', background: '#fff', borderRadius: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {hiringStatus.replace('_', ' ')}
            </span>
        </div>
    );
};
