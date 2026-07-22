export class CommunicationEvaluator {
    evaluate(result) {
        result.categoryScores.Communication = Math.min(100, result.overallScore + 2);
        return result;
    }
}
