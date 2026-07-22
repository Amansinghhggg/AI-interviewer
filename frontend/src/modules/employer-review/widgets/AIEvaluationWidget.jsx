import React from 'react';

export const AIEvaluationWidget = () => {
    return (
        <div className="widget ai-evaluation-widget" style={{ padding: '40px 20px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ced4da', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>🤖</div>
            <h3 style={{ color: '#495057', margin: 0 }}>AI Evaluation Coming Soon</h3>
            <p style={{ color: '#6c757d', fontSize: '0.9em', marginTop: '10px' }}>
                Comprehensive insights and scoring will be available in the next update.
            </p>
        </div>
    );
};
