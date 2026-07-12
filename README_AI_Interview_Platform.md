# AI Interview Platform

> **A production-oriented AI recruitment platform built phase by phase.**

## Vision

This project is an AI-powered recruitment platform that helps companies automate the initial screening round of hiring.

Instead of HR interviewing every applicant manually, employers create AI interviews, invite selected candidates, and receive detailed AI-generated reports.

## Development Philosophy

**Important for AI Coding Agents (Cursor, Claude Code, Gemini CLI, Copilot):**

- This project is developed **phase by phase**.
- Implement **only the current phase**.
- Do NOT implement future features unless explicitly instructed.
- Keep the architecture modular for future expansion.

---

## Employer Flow

1. Login/Register
2. Create Hiring Campaign
3. Define:
   - Job Role
   - Topics
   - Difficulty
   - Duration
4. Add candidate email addresses.
5. Generate Interview Code.
6. Share the interview code.
7. View candidate results after completion.

---

## Candidate Flow

1. Login/Register.
2. Enter Interview Code.
3. Email must exist in the employer's invited list.
4. Grant Camera & Microphone permissions.
5. Network check.
6. Read instructions.
7. Start interview.
8. Submit interview.
9. Interview is locked permanently.

Candidates CANNOT:
- View AI score.
- View reports.
- Retake interview.
- View recordings.

---

## Employer Dashboard

Employer can:

- Create Hiring Campaigns
- Assign candidates
- Track interview status
- View reports
- View transcript
- View recording
- See AI recommendation

Candidate status:

- Pending
- In Progress
- Completed

---

## Report

Each report contains:

- Overall Score
- Technical Score
- Communication
- Problem Solving
- Strengths
- Weaknesses
- Hiring Recommendation
- Transcript
- Recording Link

Behaviour observations:

- Tab Switch Count
- Face Missing Duration
- Multiple Faces
- Network Interruptions

These are observations, not proof of cheating.

---

# Roadmap

## Phase 1 (Current)

Build ONLY:

- Employer Authentication
- Candidate Authentication
- JWT + HTTP-only Cookies
- Protected Routes
- Employer Dashboard
- Candidate Dashboard
- Basic Create Hiring Campaign

Do NOT implement:

- AI
- Redis
- BullMQ
- Socket.IO
- Recording
- Reports

## Phase 2

- Interview Management
- Interview Code
- Candidate Assignment
- Candidate Status

## Phase 3

- Socket.IO
- Real-time Interview
- Timer

## Phase 4

- AI Question Generation
- Speech-to-Text
- AI Evaluation

## Phase 5

- Recording
- Transcript
- Reports

## Phase 6

- Redis
- Face Detection
- Anti-cheating

## Phase 7

- BullMQ
- Email Notifications
- PDF Reports

---

# Tech Stack

Frontend:
- React (Vite)
- Tailwind CSS
- React Router

Backend:
- Node.js
- Express.js
- JWT

Database:
- MongoDB

Future:
- Socket.IO
- Redis
- BullMQ
- Cloudinary
- Gemini/OpenAI

---

# Architecture

Start as a **Modular Monolith**.

```
modules/
├── auth/
├── users/
├── employer/
├── candidate/
├── interview/
├── ai/
├── report/
└── recording/
```

Goal: Build a production-quality recruitment platform one phase at a time.
