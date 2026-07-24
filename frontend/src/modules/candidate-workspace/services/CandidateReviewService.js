import { REVIEW_STATES, CANDIDATE_STATUSES } from '../config/constants.js';
import { normalizeReviewData } from '../utils/normalize.js';
import { ReplayEngine } from '../../replay/index.js';
import { ReplayMapper } from '../../replay/mappers/ReplayMapper.js';

export class CandidateReviewService {
    constructor() {
        this.state = REVIEW_STATES.LOADING;
        this.review = null;
        
        // Local state for Sprint 13
        this.hiringStatus = CANDIDATE_STATUSES.PENDING_REVIEW;
        this.notes = [];
        
        this.listeners = {
            statechange: [],
            reviewchange: [],
            statuschange: [],
            noteschange: []
        };
    }

    async loadSession(session) {
        try {
            this.updateState(REVIEW_STATES.LOADING);
            
            // Normalize session into review model
            this.review = normalizeReviewData(session);
            this.emit('reviewchange', this.review);
            
            // Initialize ReplayEngine using mapped session
            const replaySession = ReplayMapper.map(session);
            ReplayEngine.loadSession(replaySession);
            
            // In a real app we'd load status and notes from backend here.
            this.hiringStatus = CANDIDATE_STATUSES.PENDING_REVIEW;
            this.emit('statuschange', this.hiringStatus);
            
            this.updateState(REVIEW_STATES.READY);
        } catch (error) {
            console.error('Failed to load session for review', error);
            this.updateState(REVIEW_STATES.ERROR);
        }
    }

    updateStatus(newStatus) {
        if (Object.values(CANDIDATE_STATUSES).includes(newStatus)) {
            this.hiringStatus = newStatus;
            this.emit('statuschange', this.hiringStatus);
        }
    }

    addNote(text, author = 'Current User') {
        if (!text.trim()) return;
        const newNote = {
            id: `note_${Date.now()}`,
            text,
            author,
            createdAt: new Date().toISOString()
        };
        this.notes = [...this.notes, newNote];
        this.emit('noteschange', this.notes);
    }

    resetStatus() {
        this.updateStatus(CANDIDATE_STATUSES.PENDING_REVIEW);
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

export const candidateReviewService = new CandidateReviewService();
