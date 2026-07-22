export class EvaluationResult {
    constructor({
        overallScore = 0,
        confidence = 0,
        categoryScores = {},
        questionEvaluations = [],
        strengths = [],
        weaknesses = [],
        summary = '',
        recommendation = null
    } = {}) {
        this.overallScore = overallScore;
        this.confidence = confidence;
        this.categoryScores = categoryScores;
        this.questionEvaluations = questionEvaluations;
        this.strengths = strengths;
        this.weaknesses = weaknesses;
        this.summary = summary;
        this.recommendation = recommendation;
    }
}
