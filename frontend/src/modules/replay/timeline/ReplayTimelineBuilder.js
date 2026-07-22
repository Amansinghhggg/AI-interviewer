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
                if (q.askedAt) {
                    const qStart = (new Date(q.askedAt).getTime() - sessionStart) / 1000;
                    const qEnd = q.answeredAt 
                        ? (new Date(q.answeredAt).getTime() - sessionStart) / 1000 
                        : qStart + 15; // fallback
                    
                    timeline.push({
                        id: `question-${index}`,
                        type: TIMELINE_EVENT_TYPES.QUESTION,
                        startTime: Math.max(0, qStart),
                        endTime: Math.max(0, qEnd),
                        payload: { question: q.text, answer: q.answer, index: index + 1 }
                    });
                }
            });
        }

        // 3. Violations
        if (session.violations) {
            session.violations.forEach((v, index) => {
                const vStart = v.timestamp ? (new Date(v.timestamp).getTime() - sessionStart) / 1000 : 0;
                const vEnd = v.resolvedAt ? (new Date(v.resolvedAt).getTime() - sessionStart) / 1000 : vStart + 5;
                
                timeline.push({
                    id: `violation-${index}`,
                    type: TIMELINE_EVENT_TYPES.VIOLATION,
                    startTime: Math.max(0, vStart),
                    endTime: Math.max(0, vEnd),
                    payload: { rule: v.rule || v.type, message: v.message || 'Violation detected' }
                });
            });
        }

        // 4. Monitoring Events
        if (session.monitoring) {
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
