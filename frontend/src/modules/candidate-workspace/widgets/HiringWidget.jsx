import React from 'react';

export const HiringWidget = () => {
    return (
        <div className="widget hiring-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Hiring Decision</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button style={{ flex: 1, padding: '10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hire</button>
                <button style={{ flex: 1, padding: '10px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Shortlist</button>
                <button style={{ flex: 1, padding: '10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
            </div>
            <textarea 
                placeholder="Add private notes..." 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical', boxSizing: 'border-box' }} 
                rows={3} 
            />
        </div>
    );
};
