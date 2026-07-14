# AGENTS.md

# AI Interview Platform — Coding Agent Instructions

## Current Phase

**Phase 5 – AI Evaluation & Results**

The project is NO LONGER in the static interview phase.

Authentication, Campaign Management, Static Interview Flow, AI Architecture, and Real AI Interview Flow have already been completed.

---

# Completed Features

## Authentication

- Employer Login
- Candidate Login
- JWT Authentication
- Role-based Authorization

## Campaign Management

- Create Interview
- Assign Candidates
- Interview Codes
- Candidate Dashboard
- Employer Dashboard
- Interview Details
- Candidate Status Tracking

## Static Interview

- Pre-Interview Checks
- Timer
- Local Storage Recovery
- Fullscreen Support
- Browser Protection

## AI Architecture

Completed

- InterviewEngine
- InterviewConfig
- PromptContext
- InterviewState
- ConversationHistory
- Prompt Builders
- Prompt Validator
- Gemini Provider
- AI Provider Factory
- AIProviderResponse
- Response Parser
- Response Validator
- GeminiQuestionProvider

## Real AI Interview Flow

Completed

- Persistent MongoDB InterviewSession
- InterviewSessionService
- Adaptive AI Question Generation
- Gemini generates one question at a time
- Dynamic PromptContext rebuilding
- Backend session is the source of truth
- Frontend session restoration
- Question-by-question interview flow

---

# Current Objective

Build the AI Evaluation pipeline.

The interview flow already exists.

After the interview finishes:

InterviewSession

↓

EvaluationPromptBuilder

↓

Gemini

↓

EvaluationResponseParser

↓

EvaluationResponseValidator

↓

InterviewResult

↓

Employer Dashboard

---

# Build Only

- AI Evaluation
- InterviewResult model
- Evaluation Prompt
- Evaluation Parser
- Evaluation Validator
- Employer Results View

---

# Do NOT Build Yet

- Redis
- Socket.IO
- BullMQ
- Recording
- Face Detection
- Anti-cheating
- Live Streaming
- Practice Mode
- Notifications
- Email Automation
- Deployment

---

# Architecture Rules

1. Controllers must remain thin.

2. Business logic belongs inside services.

3. InterviewEngine must remain provider-agnostic.

4. Providers must never access MongoDB.

5. Prompt Builders only generate prompts.

6. Parsers only parse.

7. Validators only validate.

8. Services coordinate business logic.

9. InterviewSession is the runtime source of truth.

10. LocalStorage is only for temporary UI state.

11. InterviewResult is generated only after interview completion.

12. Never duplicate state unnecessarily.

13. Keep the project modular and scalable.

14. Use ES Modules throughout the backend.

15. Follow the existing folder structure and architecture.

---

# Current AI Flow

Candidate

↓

InterviewSession

↓

InterviewEngine

↓

GeminiQuestionProvider

↓

QuestionPromptBuilder

↓

PromptValidator

↓

GeminiProvider

↓

AIProviderResponse

↓

QuestionResponseParser

↓

QuestionResponseValidator

↓

Question[]

---

# Upcoming Roadmap

Phase 5 Part 2
- AI Evaluation

Phase 5 Part 3
- InterviewResult

Phase 5 Part 4
- Employer Result Dashboard

Phase 6
- Practice Mode

Phase 7
- Recording

Phase 8
- Redis + Socket.IO + BullMQ

Phase 9
- Anti-cheating

Phase 10
- Deployment