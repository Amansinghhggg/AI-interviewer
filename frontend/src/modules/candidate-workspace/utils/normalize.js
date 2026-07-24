export function normalizeReviewData(session) {
    if (!session) return null;

    const totalQuestions = session.conversation?.questions?.length || 0;
    const totalViolations = session.violations?.length || 0;
    
    // Count warning and critical violations if severity exists
    const warningCount = session.violations?.filter(v => v.severity === 'WARNING').length || 0;
    const criticalCount = session.violations?.filter(v => v.severity === 'CRITICAL').length || 0;

    return {
        candidate: {
            id: session.candidateId,
            name: session.metadata?.candidateName || 'Candidate Name',
            position: session.metadata?.position || 'Position',
            status: session.metadata?.status || 'Completed'
        },
        interview: {
            id: session.interviewId,
            sessionId: session.sessionId,
            date: session.startedAt,
            duration: session.duration || 0,
        },
        replay: {
            recordingUrl: session.recording?.url || null
        },
        transcript: {
            questions: session.conversation?.questions || []
        },
        violations: session.violations || [],
        statistics: {
            totalQuestions,
            totalDuration: session.duration || 0,
            totalViolations,
            warningCount,
            criticalCount
        },
        aiEvaluation: session.aiEvaluation || null,
        hiringDecision: session.hiringDecision || null
    };
}
