import { useState, useEffect } from 'react';
import { candidateReviewService } from '../services/CandidateReviewService.js';

export function useCandidateReview() {
    const [state, setState] = useState(candidateReviewService.state);
    const [review, setReview] = useState(candidateReviewService.review);
    const [hiringStatus, setHiringStatus] = useState(candidateReviewService.hiringStatus);
    const [notes, setNotes] = useState(candidateReviewService.notes);

    useEffect(() => {
        const handleStateChange = (newState) => setState(newState);
        const handleReviewChange = (newReview) => setReview(newReview);
        const handleStatusChange = (newStatus) => setHiringStatus(newStatus);
        const handleNotesChange = (newNotes) => setNotes(newNotes);

        candidateReviewService.on('statechange', handleStateChange);
        candidateReviewService.on('reviewchange', handleReviewChange);
        candidateReviewService.on('statuschange', handleStatusChange);
        candidateReviewService.on('noteschange', handleNotesChange);
        
        setState(candidateReviewService.state);
        setReview(candidateReviewService.review);
        setHiringStatus(candidateReviewService.hiringStatus);
        setNotes(candidateReviewService.notes);

        return () => {
            candidateReviewService.off('statechange', handleStateChange);
            candidateReviewService.off('reviewchange', handleReviewChange);
            candidateReviewService.off('statuschange', handleStatusChange);
            candidateReviewService.off('noteschange', handleNotesChange);
        };
    }, []);

    const loadSession = (session) => {
        candidateReviewService.loadSession(session);
    };

    const updateStatus = (status) => {
        candidateReviewService.updateStatus(status);
    };

    const addNote = (text) => {
        candidateReviewService.addNote(text);
    };

    const resetStatus = () => {
        candidateReviewService.resetStatus();
    };

    return {
        review,
        state,
        hiringStatus,
        notes,
        actions: {
            loadSession,
            updateStatus,
            addNote,
            resetStatus
        }
    };
}
