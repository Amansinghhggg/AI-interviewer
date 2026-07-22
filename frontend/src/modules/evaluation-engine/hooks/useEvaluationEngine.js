import { useState, useEffect, useCallback } from 'react';
import { evaluationEngineService } from '../services/EvaluationEngineService.js';
import { EVALUATION_STATES } from '../config/constants.js';

export function useEvaluationEngine(session) {
    const [state, setState] = useState(evaluationEngineService.state);
    const [evaluation, setEvaluation] = useState(evaluationEngineService.evaluation);

    useEffect(() => {
        const handleStateChange = (newState) => setState(newState);
        const handleEvaluationChange = (newEval) => setEvaluation(newEval);

        evaluationEngineService.on('statechange', handleStateChange);
        evaluationEngineService.on('evaluationchange', handleEvaluationChange);

        return () => {
            evaluationEngineService.off('statechange', handleStateChange);
            evaluationEngineService.off('evaluationchange', handleEvaluationChange);
        };
    }, []);

    useEffect(() => {
        if (session && evaluationEngineService.state === EVALUATION_STATES.IDLE) {
            evaluationEngineService.evaluate(session);
        }
    }, [session]);

    const regenerate = useCallback(() => {
        if (session) {
            evaluationEngineService.evaluate(session);
        }
    }, [session]);

    return {
        evaluation,
        loading: state === EVALUATION_STATES.EVALUATING,
        error: state === EVALUATION_STATES.ERROR,
        regenerate
    };
}
