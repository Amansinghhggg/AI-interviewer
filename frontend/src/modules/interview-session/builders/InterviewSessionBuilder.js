import { InterviewSession } from '../models/InterviewSession';
import { validateInterviewSession } from '../utils/session.validation';
import { INTERVIEW_SESSION_CONFIG } from '../config/session.config';

export class InterviewSessionBuilder {
  constructor() {
    this.sessionData = {
      sessionId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      metadata: {
        sessionVersion: INTERVIEW_SESSION_CONFIG.sessionVersion,
        runtimeVersion: INTERVIEW_SESSION_CONFIG.runtimeVersion
      }
    };
    this.isFinalized = false;
  }

  initialize({ interviewId, candidateId, metadata = {} }) {
    this._ensureNotFinalized();
    this.sessionData.interviewId = interviewId;
    this.sessionData.candidateId = candidateId;
    this.sessionData.startedAt = Date.now();
    
    // Merge runtime metadata (browser, platform, timezone) safely
    this.sessionData.metadata = {
      ...this.sessionData.metadata,
      ...metadata
    };
    return this;
  }

  attachRecording(recordingSession) {
    this._ensureNotFinalized();
    this.sessionData.recording = recordingSession;
    return this;
  }

  attachConversation({ questions = [], answers = [] }) {
    this._ensureNotFinalized();
    this.sessionData.conversation = {
      questions,
      answers
    };
    return this;
  }

  attachViolations({ active = [], history = [], timeline = [], statistics = {} }) {
    this._ensureNotFinalized();
    this.sessionData.violations = {
      active,
      history,
      timeline,
      statistics
    };
    // For convenience, also hoist statistics
    this.sessionData.statistics = statistics;
    return this;
  }

  attachMonitoring({ device = {}, browser = {}, face = {} }) {
    this._ensureNotFinalized();
    this.sessionData.monitoring = {
      device,
      browser,
      face
    };
    return this;
  }

  finalize() {
    this._ensureNotFinalized();
    
    this.sessionData.endedAt = Date.now();
    
    if (this.sessionData.startedAt) {
      this.sessionData.duration = this.sessionData.endedAt - this.sessionData.startedAt;
    }

    const validation = validateInterviewSession(this.sessionData);
    if (!validation.isValid) {
      throw new Error(`InterviewSession validation failed: ${validation.errors.join(', ')}`);
    }

    this.isFinalized = true;
    return this;
  }

  build() {
    if (!this.isFinalized) {
      throw new Error("Cannot build() before finalize() is called.");
    }

    const session = new InterviewSession(this.sessionData);
    
    // Deep freeze the session to ensure immutability
    return this._deepFreeze(session);
  }

  _ensureNotFinalized() {
    if (this.isFinalized) {
      throw new Error("InterviewSession is finalized. No further modifications allowed.");
    }
  }

  _deepFreeze(object) {
    const propNames = Object.getOwnPropertyNames(object);
    for (const name of propNames) {
      const value = object[name];
      if (value && typeof value === "object") {
        this._deepFreeze(value);
      }
    }
    return Object.freeze(object);
  }
}
