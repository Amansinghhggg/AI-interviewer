import { EVALUATION_STATES } from '../config/constants.js';
import { EvaluationProvider } from './EvaluationProvider.js';
import { TechnicalEvaluator } from '../evaluators/TechnicalEvaluator.js';
import { CommunicationEvaluator } from '../evaluators/CommunicationEvaluator.js';
import { BehavioralEvaluator } from '../evaluators/BehavioralEvaluator.js';
import { ProblemSolvingEvaluator } from '../evaluators/ProblemSolvingEvaluator.js';
import { mapScoreToRecommendation } from '../utils/recommendation.mapper.js';

export class EvaluationEngineService {
    constructor() {
        this.provider = new EvaluationProvider();
        this.evaluators = [
            new TechnicalEvaluator(),
            new CommunicationEvaluator(),
            new BehavioralEvaluator(),
            new ProblemSolvingEvaluator()
        ];
        
        this.state = EVALUATION_STATES.IDLE;
        this.evaluation = null;
        this.listeners = {
            statechange: [],
            evaluationchange: []
        };
    }

    async evaluate(session) {
        try {
            this.updateState(EVALUATION_STATES.EVALUATING);
            
            // 1. Single Provider Request
            let result = await this.provider.evaluateInterview(session);
            
            // 2. Category Evaluators (process the Normalized Result)
            for (const evaluator of this.evaluators) {
                result = evaluator.evaluate(result);
            }
            
            // 3. Deterministic Recommendation Mapping
            result.recommendation = mapScoreToRecommendation(result.overallScore);
            
            this.evaluation = result;
            this.emit('evaluationchange', this.evaluation);
            this.updateState(EVALUATION_STATES.COMPLETE);
        } catch (error) {
            console.error('Evaluation failed:', error);
            this.updateState(EVALUATION_STATES.ERROR);
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

export const evaluationEngineService = new EvaluationEngineService();
