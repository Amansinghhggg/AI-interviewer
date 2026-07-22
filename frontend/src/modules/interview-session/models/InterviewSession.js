export class InterviewSession {
  constructor({
    sessionId,
    interviewId,
    candidateId,
    startedAt,
    endedAt,
    duration,
    recording,
    conversation,
    violations,
    monitoring,
    statistics,
    metadata
  }) {
    this.sessionId = sessionId;
    this.interviewId = interviewId;
    this.candidateId = candidateId;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.duration = duration;
    this.recording = recording;
    this.conversation = conversation;
    this.violations = violations;
    this.monitoring = monitoring;
    this.statistics = statistics;
    this.metadata = metadata;
  }
}
