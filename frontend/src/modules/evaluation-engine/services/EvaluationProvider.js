import { EvaluationResult } from '../models/EvaluationResult.js';

export class EvaluationProvider {
    /**
     * Mocks a single AI request that evaluates the entire session and returns a normalized result base.
     */
    async evaluateInterview(session) {
        // Simulate network delay for AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const overallScore = Math.floor(Math.random() * 40) + 60; // 60-100
        const confidence = 0.92;
        
        const questionEvaluations = (session.conversation?.questions || []).map((q, index) => ({
            questionId: q.id || `q-${index}`,
            score: Math.floor(Math.random() * 5) + 1, // 1-5
            strengths: ['Clear answer', 'Good context provided'],
            weaknesses: ['Could be more detailed'],
            feedback: 'The candidate answered this well overall.'
        }));
        
        return new EvaluationResult({
            overallScore,
            confidence,
            questionEvaluations,
            strengths: ['Strong technical background', 'Clear communication'],
            weaknesses: ['Slightly hesitant on system design'],
            summary: 'The candidate demonstrated a solid grasp of the core concepts but could improve on architectural discussions.'
        });
    }
}
