import React, { useState } from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';

export const EmployerNotesWidget = () => {
    const { notes, actions } = useCandidateReview();
    const [draft, setDraft] = useState('');

    const handleAddNote = () => {
        if (draft.trim()) {
            actions.addNote(draft);
            setDraft('');
        }
    };

    return (
        <div className="widget employer-notes-widget" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Employer Notes</h3>
            
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                {notes.length === 0 ? (
                    <p style={{ color: '#777', fontStyle: 'italic', margin: 0 }}>No notes added yet.</p>
                ) : (
                    notes.map(note => (
                        <div key={note.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', borderLeft: '4px solid #2196f3' }}>
                            <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{note.author}</strong>
                                <span>{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={{ color: '#333', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{note.text}</div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea 
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add a new note..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical', boxSizing: 'border-box' }} 
                    rows={3} 
                />
                <button 
                    onClick={handleAddNote}
                    disabled={!draft.trim()}
                    style={{ padding: '8px 16px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: draft.trim() ? 'pointer' : 'not-allowed', alignSelf: 'flex-end', opacity: draft.trim() ? 1 : 0.6 }}>
                    Add Note
                </button>
            </div>
        </div>
    );
};
