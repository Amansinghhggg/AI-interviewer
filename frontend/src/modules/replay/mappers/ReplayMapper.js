export class ReplayMapper {
    /**
     * Maps the InterviewResult backend DTO to the model expected by ReplayEngine.
     * Keeps ReplayEngine agnostic of backend changes.
     */
    static map(resultData) {
        if (!resultData) return null;

        const durationSec = resultData.recording?.duration || (resultData.evaluation?.durationMs / 1000) || 0;
        const numQuestions = resultData.questionBreakdown?.length || 1;
        const timePerQuestion = durationSec / numQuestions;

        // Resolve exact session start timestamp
        const firstQuestionAskedAt = resultData.questionBreakdown?.find(q => q?.askedAt)?.askedAt;
        let sessionStartMs;

        if (resultData.startedAt) {
            sessionStartMs = new Date(resultData.startedAt).getTime();
        } else if (firstQuestionAskedAt) {
            sessionStartMs = new Date(firstQuestionAskedAt).getTime();
        } else if (resultData.evaluation?.evaluatedAt) {
            sessionStartMs = new Date(resultData.evaluation.evaluatedAt).getTime() - (durationSec * 1000);
        } else {
            sessionStartMs = Date.now() - (durationSec * 1000);
        }

        const mappedQuestions = (resultData.questionBreakdown || []).map((q, i) => {
            const simulatedStart = sessionStartMs + (i * timePerQuestion * 1000);
            const simulatedEnd = simulatedStart + (timePerQuestion * 1000);
            
            const qAskedAt = q.askedAt ? new Date(q.askedAt).getTime() : simulatedStart;
            const qEndedAt = q.questionEndedAt ? new Date(q.questionEndedAt).getTime() : null;
            const qAnsweredAt = q.answeredAt ? new Date(q.answeredAt).getTime() : simulatedEnd;

            return {
                id: q.questionId || `q-${i}`,
                text: q.question,
                answer: q.answer,
                askedAt: new Date(qAskedAt),
                questionEndedAt: qEndedAt ? new Date(qEndedAt) : null,
                answeredAt: new Date(qAnsweredAt)
            };
        });

        // Map violations from the session's violation timeline.
        const rawViolations = resultData.violations || resultData.recording?.violations || [];
        const mappedViolations = rawViolations.map((v, i) => ({
            id: v.id || `violation-${i}`,
            type: v.type || v.rule || 'UNKNOWN',
            severity: v.severity || 'WARNING',
            message: v.message || v.description || v.type || 'Violation detected',
            timestamp: v.timestamp ? new Date(v.timestamp) : null,
            resolvedAt: v.resolvedAt ? new Date(v.resolvedAt) : null,
        }));

        return {
            startedAt: new Date(sessionStartMs),
            endedAt: new Date(sessionStartMs + (durationSec * 1000)),
            duration: durationSec,
            recording: resultData.recording || { url: '', duration: durationSec, mimeType: 'video/webm' },
            conversation: {
                questions: mappedQuestions,
                answers: {}
            },
            violations: mappedViolations,
            monitoring: []
        };
    }
}
