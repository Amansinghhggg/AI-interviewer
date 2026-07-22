export class TechnicalEvaluator {
    evaluate(result) {
        result.categoryScores.Technical = Math.min(100, result.overallScore + 5);
        return result;
    }
}
