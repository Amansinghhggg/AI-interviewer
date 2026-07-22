export class ProblemSolvingEvaluator {
    evaluate(result) {
        result.categoryScores.ProblemSolving = Math.min(100, result.overallScore + 1);
        return result;
    }
}
