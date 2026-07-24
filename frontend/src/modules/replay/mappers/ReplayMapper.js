export class ReplayMapper {
    /**
     * Maps the InterviewResult backend DTO to the model expected by ReplayEngine.
     * Keeps ReplayEngine agnostic of backend changes.
     */
    static map(resultData) {
        if (!resultData) return null;

        // Estimate sequential timelines if real timestamps aren't saved
        // We space questions out across the duration of the recording
        const durationSec = resultData.recording?.duration || (resultData.evaluation?.durationMs / 1000) || 0;
        const numQuestions = resultData.questionBreakdown?.length || 1;
        const timePerQuestion = durationSec / numQuestions;

        const sessionStart = resultData.evaluation?.evaluatedAt 
            ? new Date(resultData.evaluation.evaluatedAt).getTime() 
            : Date.now();

        const mappedQuestions = (resultData.questionBreakdown || []).map((q, i) => {
            const simulatedStart = sessionStart + (i * timePerQuestion * 1000);
            const simulatedEnd = simulatedStart + (timePerQuestion * 1000);
            return {
                id: q.questionId,
                text: q.question,
                answer: q.answer,
                askedAt: new Date(simulatedStart),
                answeredAt: new Date(simulatedEnd)
            };
        });

        return {
            startedAt: new Date(sessionStart),
            endedAt: new Date(sessionStart + (durationSec * 1000)),
            duration: durationSec,
            recording: resultData.recording || { url: '', duration: durationSec, mimeType: 'video/webm' },
            conversation: {
                questions: mappedQuestions,
                answers: {}
            },
            violations: [],
            monitoring: []
        };
    }
}
