import { REVIEW_STATES } from '../config/constants.js';
import { normalizeReviewData } from '../utils/normalize.js';
import { ReplayEngine } from '../../replay/index.js';

export class EmployerReviewService {
    constructor() {
        this.state = REVIEW_STATES.LOADING;
        this.review = null;
        this.listeners = {
            statechange: [],
            reviewchange: []
        };
    }

    async loadSession(session) {
        try {
            this.updateState(REVIEW_STATES.LOADING);
            
            // Normalize session into review model
            this.review = normalizeReviewData(session);
            this.emit('reviewchange', this.review);
            
            // Initialize ReplayEngine, but the workspace doesn't control playback,
            // we just load it so the embedded widgets work automatically.
            ReplayEngine.loadSession(session);
            
            this.updateState(REVIEW_STATES.READY);
        } catch (error) {
            console.error('Failed to load session for review', error);
            this.updateState(REVIEW_STATES.ERROR);
        }
    }

    updateState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.emit('statechange', this.state);
        }
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

export const employerReviewService = new EmployerReviewService();
