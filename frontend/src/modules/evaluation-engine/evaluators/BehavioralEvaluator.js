export class BehavioralEvaluator {
    evaluate(result) {
        result.categoryScores.Behavioral = Math.max(0, result.overallScore - 3);
        return result;
    }
}
