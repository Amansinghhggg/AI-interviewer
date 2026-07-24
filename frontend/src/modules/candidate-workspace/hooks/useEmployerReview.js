import { useState, useEffect } from 'react';
import { employerReviewService } from '../services/EmployerReviewService.js';

export function useEmployerReview() {
    const [state, setState] = useState(employerReviewService.state);
    const [review, setReview] = useState(employerReviewService.review);

    useEffect(() => {
        const handleStateChange = (newState) => setState(newState);
        const handleReviewChange = (newReview) => setReview(newReview);

        employerReviewService.on('statechange', handleStateChange);
        employerReviewService.on('reviewchange', handleReviewChange);
        
        setState(employerReviewService.state);
        setReview(employerReviewService.review);

        return () => {
            employerReviewService.off('statechange', handleStateChange);
            employerReviewService.off('reviewchange', handleReviewChange);
        };
    }, []);

    const loadSession = (session) => {
        employerReviewService.loadSession(session);
    };

    return {
        review,
        state,
        actions: {
            loadSession
        }
    };
}
