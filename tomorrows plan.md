# Phase 8 — Voice Interview System Roadmap

## Overview

This document outlines the complete implementation roadmap for introducing **Voice Interviews** into the AI Interview Platform.

The objective is to extend the current interview architecture while **keeping the Interview Engine completely unchanged**. The Interview Engine should continue to communicate only through **text**, regardless of whether the candidate types or speaks.

Voice will therefore act as an **adapter layer**, converting:

- AI Text → Speech (TTS)
- Candidate Speech → Text (STT)

This architecture keeps the system modular, provider-agnostic, and future-proof.

---

# Core Design Principles

## 1. Interview Engine Never Changes

Current flow:

```
Question (Text)
        ↓
Answer (Text)
        ↓
Interview Engine
```

Future flow:

```
Question (Text)
        ↓
Text-to-Speech
        ↓
Candidate Hears Question
        ↓
Candidate Speaks
        ↓
Speech-to-Text
        ↓
Answer (Text)
        ↓
Interview Engine
```

The Interview Engine should never know whether the answer came from typing or speaking.

---

## 2. Voice is a Separate Module

```
modules

├── interview
├── voice
└── monitoring
```

The Interview module remains untouched.

Voice becomes an independent adapter layer.

---

## 3. Backend Owns AI

The frontend should never communicate directly with STT/TTS providers.

Instead:

```
Browser

↓

Backend Voice Module

↓

AI Provider
```

Benefits

- Provider swapping
- Better security
- Easier debugging
- Centralized configuration
- Future analytics

---

# Final Architecture

```
                    Interview Engine
                           ▲
                           │
                    Transcript (Text)
                           ▲
                           │
                   Speech Service (STT)
                           ▲
                           │
                    Audio Upload API
                           ▲
                           │
                    Browser Recorder


Interview Engine
        │
        ▼
   Question Text
        │
        ▼
      TTS Service
        │
        ▼
    Audio Playback
```

---

# Phase 8 Part 1 — Voice Module Foundation

## Goal

Create a provider-based Voice Module that mirrors the architecture already used for Question Providers and Evaluation Providers.

No Interview logic should be modified.

---

## Why

The project already follows provider abstractions for AI.

Voice should follow exactly the same philosophy.

---

## Proposed Folder Structure

```
backend/src/modules/voice

├── config
│
├── controllers
│      └── voice.controller.js
│
├── routes
│      └── voice.routes.js
│
├── services
│      ├── SpeechService.js
│      └── TTSService.js
│
├── providers
│      ├── SpeechProvider
│      │      ├── BaseSpeechProvider.js
│      │      ├── GroqSpeechProvider.js
│      │      └── index.js
│      │
│      └── TTSProvider
│             ├── BaseTTSProvider.js
│             ├── OpenAITTSProvider.js
│             └── index.js
│
└── utils
```

---

## Scope

Create

- Voice Module
- Provider Interfaces
- Provider Registry
- Configuration
- Dependency Wiring

Do NOT

- Call any AI
- Record audio
- Modify Interview Engine
- Modify Frontend

---

## Deliverables

- Voice module exists
- Providers created
- Configuration complete
- Backend builds successfully

---

## Verification

- Project starts successfully
- Routes register
- No Interview functionality is affected

---

# Phase 8 Part 2 — Speech-to-Text Backend

## Goal

Build the backend Speech-to-Text pipeline.

---

## Architecture

```
Audio Upload

↓

Speech Service

↓

Speech Provider

↓

Groq Whisper

↓

Transcript
```

---

## API

```
POST /api/voice/transcribe
```

Accept

```
multipart/form-data
```

Return

```json
{
    "success": true,
    "transcript": "React uses Virtual DOM..."
}
```

---

## Scope

Create

- SpeechService
- GroqSpeechProvider
- Upload endpoint
- Error handling
- Validation

Do NOT

- Integrate with Interview
- Store recordings
- Build frontend

---

## Deliverables

Working transcription endpoint.

---

## Verification

Upload

```
sample.webm
```

Receive

```
Transcript
```

---

# Phase 8 Part 3 — Frontend Recorder

## Goal

Allow candidates to record voice inside the browser.

---

## Architecture

```
Candidate

↓

MediaRecorder

↓

Audio Blob
```

---

## Features

- Microphone Permission
- Start Recording
- Stop Recording
- Timer
- Playback
- Delete Recording

---

## Scope

Frontend only.

No backend integration.

---

## Deliverables

Browser can successfully record audio.

---

## Verification

Record

↓

Playback

↓

Recording works correctly.

---

# Phase 8 Part 4 — Upload & Transcription Integration

## Goal

Connect the browser recorder to the backend STT endpoint.

---

## Flow

```
MediaRecorder

↓

Audio Blob

↓

POST /voice/transcribe

↓

Speech Service

↓

Transcript

↓

Display Transcript
```

---

## Scope

Integrate recorder with SpeechService.

Still no Interview integration.

---

## Deliverables

Audio successfully becomes text.

---

## Verification

Record

↓

Upload

↓

Transcript displayed on screen.

---

# Phase 8 Part 5 — Text-to-Speech Backend

## Goal

Allow AI-generated questions to be spoken aloud.

---

## Architecture

```
Question Text

↓

TTS Service

↓

Speech Provider

↓

Audio

↓

Frontend
```

---

## API

```
POST /api/voice/speak
```

Returns

```
audio/mpeg
```

---

## Scope

Create

- TTSService
- TTS Provider
- Audio endpoint

---

## Deliverables

Question converted into playable audio.

---

## Verification

Question text

↓

Audio returned

↓

Audio plays correctly.

---

# Phase 8 Part 6 — Voice Interview Integration

## Goal

Integrate voice into the interview flow without modifying Interview Engine.

---

## Flow

```
Question

↓

Play Audio

↓

Candidate Records

↓

Upload

↓

Transcript

↓

InterviewSessionService.submitAnswer()

↓

Interview Engine

↓

Next Question
```

---

## Important Rule

Interview Engine still receives

```ts
answer: string
```

Nothing changes internally.

---

## Deliverables

A complete voice interview experience.

---

## Verification

Complete an interview using only voice.

---

# Phase 8 Part 7 — Audio Persistence

## Goal

Persist candidate recordings for replay and future analysis.

---

## Store

```
Question

Answer

Transcript

Audio URL
```

Example

```json
{
    "question": "...",
    "answer": "...",
    "audioUrl": "/uploads/audio/q4.webm"
}
```

---

## Future Benefits

- Employer replay
- Better evaluation
- Re-transcription
- Communication analysis

---

## Verification

Audio successfully stored and retrievable.

---

# Phase 8 Part 8 — Voice Quality Improvements

## Goal

Improve recording reliability.

---

## Features

- Retry uploads
- Noise suppression
- Silence detection
- Audio normalization
- Maximum recording duration
- Better microphone validation

---

## Verification

Recordings remain stable under poor conditions.

---

# Phase 8 Part 9 — Streaming Voice (Future)

> Not part of Version 1.

---

## Goal

Replace upload-based transcription with streaming transcription.

---

## Architecture

```
Microphone

↓

Socket/WebRTC

↓

Streaming STT

↓

Transcript

↓

Interview Engine
```

---

## Why Later?

Requires

- Socket.IO
- Streaming providers
- Buffer management
- Reconnection logic
- Much higher complexity

Current upload architecture should be completed first.

---

# Phase 8 Part 10 — Monitoring Integration

Voice is complete.

Monitoring begins.

---

## Monitoring Module

```
Monitoring

├── Camera
├── Face Detection
├── Screen Recording
├── Fullscreen Detection
├── Network Monitoring
├── Tab Detection
└── Violation Manager
```

Monitoring remains completely independent from Voice.

---

# Sprint Roadmap

| Sprint | Phase | Deliverable |
|---------|-------|-------------|
| Sprint 1 | Parts 1 + 2 | Voice Backend + STT API |
| Sprint 2 | Parts 3 + 4 | Frontend Recorder + Upload + Transcript |
| Sprint 3 | Part 5 | AI Speaks Questions |
| Sprint 4 | Part 6 | Full Voice Interview |
| Sprint 5 | Part 7 | Audio Persistence |
| Sprint 6 | Part 8 | Voice Quality Improvements |
| Sprint 7 | Parts 9 + 10 | Streaming (Future) + Monitoring |

---

# Success Criteria

At the end of Phase 8:

- AI can speak every question.
- Candidate answers using voice.
- Audio is converted into text.
- Interview Engine remains unchanged.
- Providers remain swappable.
- Voice is fully modular.
- Monitoring can be added later without refactoring.

---

# Guiding Principles

- Keep the Interview Engine untouched.
- Voice is an adapter, not business logic.
- Backend owns all AI communication.
- Frontend only records and plays audio.
- Providers must remain replaceable.
- Avoid Socket.IO/WebRTC in Version 1.
- Every sprint must end with a fully working feature.
- Build complete vertical slices, not isolated code.