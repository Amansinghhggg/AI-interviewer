# Phase 8 — Real-Time Interview Monitoring Roadmap

## Objective

Transform the AI Interview platform from a traditional question-and-answer system into a professional, real-time monitored interview platform similar to products like HireVue, Mercer Mettl, Talview, and HackerRank.

This phase focuses entirely on improving interview integrity, reliability, and the overall interview experience.

---

# Guiding Principles

- Monitoring must be modular.
- Monitoring must remain independent of the AI Interview Engine.
- Controllers remain thin.
- Every monitoring feature should report to a centralized `ViolationManager`.
- Real-time events should be designed with future Socket.IO integration in mind.
- No monitoring logic should interfere with AI question generation or evaluation.

---

# Architecture

```
Interview Monitoring
│
├── SystemCheckService
├── CameraMonitor
├── MicrophoneMonitor
├── FaceDetectionService
├── VoiceDetectionService
├── BrowserMonitor
├── NetworkMonitor
├── FullscreenMonitor
├── DeviceMonitor
├── ViolationManager
└── MonitoringEventDispatcher
```

---

# Part 1 — Pre-Interview System Check

## Goal

Before an interview begins, verify that the candidate's environment is suitable.

### Checks

- Camera available
- Camera permission granted
- Microphone available
- Microphone permission granted
- Speaker test
- Internet speed
- Upload speed
- Network latency
- Browser compatibility
- Screen resolution
- Fullscreen support
- Device compatibility

### UI

Display a modern checklist.

Example:

```
✓ Camera Ready

✓ Microphone Ready

✓ Internet Good

✓ Browser Supported

✓ Fullscreen Supported

────────────────────────

Overall Status

🟢 Ready to Start Interview
```

---

# Part 2 — Camera & Microphone

## Features

- Live webcam preview
- Live microphone indicator
- Camera switching
- Microphone switching
- Permission recovery

Candidate must confirm everything before continuing.

---

# Part 3 — Face Detection

Using MediaPipe or Face API.

Detect:

- No face detected
- Multiple faces
- Face leaves frame
- Face too far away
- Face partially visible
- Candidate looking away (future enhancement)

Violations are sent to the Violation Manager.

---

# Part 4 — Browser Monitoring

Detect:

- Tab switching
- Window blur
- Fullscreen exit
- Copy/Paste attempts
- Right-click attempts
- DevTools opening (best effort)

Every event is logged.

---

# Part 5 — Voice Monitoring

Monitor microphone quality.

Detect:

- Microphone muted
- Long silence
- Background voices
- High background noise

No speech transcription will be performed.

Only environmental monitoring.

---

# Part 6 — Network Monitoring

Continuously monitor:

- Download speed
- Upload speed
- Ping
- Online / Offline
- Connection quality

Suggested thresholds:

### Download

- <3 Mbps → Poor
- 3–8 Mbps → Fair
- 8–20 Mbps → Good
- >20 Mbps → Excellent

### Upload

- <1 Mbps → Poor
- 1–3 Mbps → Fair
- 3–5 Mbps → Good
- >5 Mbps → Excellent

### Ping

- <50ms → Excellent
- 50–100ms → Good
- 100–200ms → Fair
- >200ms → Poor

Do NOT block the interview unless connectivity becomes critically unstable.

Instead show warnings.

---

# Part 7 — Violation Manager

Every monitoring module reports here.

Example:

```
Camera Lost

↓

ViolationManager

↓

Create Event

↓

Store

↓

Future Socket Event

↓

Employer Dashboard
```

Example event:

```json
{
    "type": "TAB_SWITCH",
    "severity": "WARNING",
    "timestamp": "...",
    "details": {}
}
```

---

# Part 8 — Monitoring Timeline

Maintain a chronological log.

Example:

```
10:02

Interview Started

10:05

Camera Lost

10:05

Camera Restored

10:08

Network Poor

10:09

Tab Switched

10:11

Returned
```

This timeline will later be visible to employers.

---

# Part 9 — Socket.IO Integration (Future)

The monitoring architecture should be designed so events can later be streamed in real time.

Example:

```
Violation

↓

Monitoring Dispatcher

↓

Socket.IO

↓

Employer Dashboard
```

No Socket.IO implementation in this phase.

Only architecture preparation.

---

# Part 10 — Employer Live Monitoring (Future)

During interviews employers will see:

- Candidate status
- Camera status
- Network quality
- Violations
- Current question
- Remaining time

This consumes monitoring events generated in this phase.

---

# Part 11 — Recording (Future)

Support:

- Webcam recording
- Microphone recording
- Optional screen recording

Recording remains completely independent of AI evaluation.

---

# Part 12 — BullMQ + Redis (Future)

Move expensive tasks into background jobs.

Examples:

- AI Evaluation
- Report generation
- Email notifications
- Recording processing

Interview completion should return immediately while BullMQ handles processing.

---

# Constraints

Do NOT modify:

- InterviewEngine
- Question Providers
- Evaluation Providers
- Prompt Builders
- AI Evaluation Pipeline

Monitoring must remain an independent subsystem.

---

# Design Principles

- Single Responsibility
- Thin Controllers
- Modular Services
- Event-driven architecture
- Future Socket.IO compatibility
- Future BullMQ compatibility
- Provider agnostic
- Easily extensible

---

# Long-Term Vision

```
Employer

↓

Create Interview

↓

Assign Candidate

↓

Candidate Joins

↓

Pre-Interview System Check

↓

Live AI Interview

↓

Real-Time Monitoring

↓

AI Evaluation

↓

Employer Dashboard

↓

Reports

↓

Notifications
```

---

# Version Roadmap

## Version 1 (Current)

- AI Interview
- AI Question Generation
- AI Evaluation
- Employer Dashboard

---

## Version 2

- Pre-Interview System Check
- Camera Monitoring
- Face Detection
- Browser Monitoring
- Network Monitoring
- Violation Manager

---

## Version 3

- Socket.IO
- Employer Live Monitoring
- Recording

---

## Version 4

- Redis
- BullMQ
- Email Notifications
- Background Processing

---

# Final Goal

Deliver a production-quality AI Interview platform that not only asks intelligent adaptive questions but also ensures interview integrity through comprehensive real-time monitoring while maintaining a clean, modular, and scalable architecture.
