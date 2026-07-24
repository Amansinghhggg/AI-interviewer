import { TIMELINE_EVENT_TYPES } from '../config/constants.js';

export class ReplayTimelineBuilder {
    /**
     * Builds a normalized, chronological timeline from the InterviewSession
     */
    static build(session) {
        const timeline = [];
        const sessionStart = session.startedAt ? new Date(session.startedAt).getTime() : 0;

        // 1. Session Start
        timeline.push({
            id: 'session-start',
            type: TIMELINE_EVENT_TYPES.SESSION_START,
            startTime: 0,
            endTime: 0,
            payload: { message: 'Candidate Joined' }
        });

        // 2. Conversation (Questions)
        if (session.conversation && session.conversation.questions) {
            session.conversation.questions.forEach((q, index) => {
                // Support both q.askedAt (legacy) and q.startedAt (new normalized shape)
                const askedAt = q.askedAt || q.startedAt;
                const answeredAt = q.answeredAt || q.endedAt;

                if (askedAt) {
                    const qStart = (new Date(askedAt).getTime() - sessionStart) / 1000;
                    const qEnd = answeredAt
                        ? (new Date(answeredAt).getTime() - sessionStart) / 1000
                        : qStart + 15; // fallback
                    
                    timeline.push({
                        id: `question-${index}`,
                        type: TIMELINE_EVENT_TYPES.QUESTION,
                        startTime: Math.max(0, qStart),
                        endTime: Math.max(0, qEnd),
                        payload: {
                            question: q.text || q.question || '',
                            answer: q.answer,
                            index: index + 1
                        }
                    });
                }
            });
        }

        // 3. Violations — handle the normalized { type, severity, message, timestamp, resolvedAt } shape
        if (session.violations && Array.isArray(session.violations)) {
            session.violations.forEach((v, index) => {
                // Violations without a timestamp are pinned at t=0 rather than discarded
                const vTimestamp = v.timestamp ? new Date(v.timestamp).getTime() : sessionStart;
                const vStart = (vTimestamp - sessionStart) / 1000;
                const vEnd = v.resolvedAt
                    ? (new Date(v.resolvedAt).getTime() - sessionStart) / 1000
                    : vStart + 5;

                timeline.push({
                    id: v.id || `violation-${index}`,
                    type: TIMELINE_EVENT_TYPES.VIOLATION,
                    startTime: Math.max(0, vStart),
                    endTime: Math.max(0, vEnd),
                    payload: {
                        rule: v.type || v.rule || 'Unknown',
                        severity: v.severity || 'WARNING',
                        message: v.message || 'Violation detected'
                    }
                });
            });
        }

        // 4. Monitoring Events
        if (session.monitoring && Array.isArray(session.monitoring)) {
            session.monitoring.forEach((m, index) => {
                const mStart = m.timestamp ? (new Date(m.timestamp).getTime() - sessionStart) / 1000 : 0;
                
                timeline.push({
                    id: `monitoring-${index}`,
                    type: TIMELINE_EVENT_TYPES.MONITORING,
                    startTime: Math.max(0, mStart),
                    endTime: Math.max(0, mStart), // point in time event
                    payload: { event: m.event, details: m.details }
                });
            });
        }

        // 5. Session End
        const sessionEnd = session.endedAt 
            ? (new Date(session.endedAt).getTime() - sessionStart) / 1000 
            : (session.duration || 0);
            
        timeline.push({
            id: 'session-end',
            type: TIMELINE_EVENT_TYPES.SESSION_END,
            startTime: Math.max(0, sessionEnd),
            endTime: Math.max(0, sessionEnd),
            payload: { message: 'Interview Finished' }
        });

        // Sort chronologically by startTime
        return timeline.sort((a, b) => a.startTime - b.startTime);
    }
}
