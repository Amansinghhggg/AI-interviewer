import { RECOMMENDATION_LEVELS } from '../config/constants.js';

export function mapScoreToRecommendation(overallScore) {
    if (overallScore >= 90) {
        return RECOMMENDATION_LEVELS.HIGHLY_RECOMMENDED;
    } else if (overallScore >= 75) {
        return RECOMMENDATION_LEVELS.RECOMMENDED;
    } else if (overallScore >= 60) {
        return RECOMMENDATION_LEVELS.BORDERLINE;
    } else {
        return RECOMMENDATION_LEVELS.NOT_RECOMMENDED;
    }
}
