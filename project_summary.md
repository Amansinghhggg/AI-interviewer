# AI Interview Platform — Project Status & Architecture Summary

## 1. Project Overview
The AI Interview Platform is a state-of-the-art web application that allows employers to create dynamic, AI-driven technical interviews and assign them to candidates. Instead of candidates answering a static list of hardcoded questions, the system utilizes Google's Gemini AI to generate adaptive questions in real-time, responding directly to the candidate's previous answers.

---

## 2. What is Implemented So Far?

The platform has successfully completed all foundational, architectural, and core interview-flow phases. **It is currently fully functional up to the point of completing a real AI interview (without the final AI grading/scoring).**

### 🏢 Employer Features (Completed)
- **Authentication**: JWT-based secure login and registration.
- **Employer Dashboard**: A complete portal to view, create, edit, and delete hiring campaigns/interviews.
- **Interview Configuration**: Employers can define the Job Role, Topics, Difficulty, Experience Level, and Duration. They can assign specific candidates by email or generate a shareable join code.

### 🧑‍💻 Candidate Features (Completed)
- **Candidate Dashboard**: A portal for candidates to see their assigned interviews and join open interviews using a join code.
- **Pre-Interview Checks**: Instructions and requirements (webcam/mic check UI).
- **Live AI Interview Environment**: A distraction-free UI featuring a progress bar, a synchronized timer, the active AI-generated question, and a rich text answer box.

---

## 3. The Core Architecture

The backend was meticulously designed using strict Software Engineering principles to ensure scalability and "provider-agnosticism" (meaning we can swap Gemini for OpenAI or Claude with just one line of code).

### The Layers of the AI Engine
1. **InterviewEngine**: The central orchestrator. It doesn't know *how* AI works; it only knows how to route requests.
2. **Prompt Architecture**:
   - `PromptContext`: A state container holding the Interview Config, Session State, and Conversation History.
   - `QuestionPromptBuilder`: Generates the exact text prompt requesting JSON from the AI.
   - `PromptValidator`: Ensures the prompt meets strict length and context rules before spending API tokens.
3. **AIProvider (Gemini)**: A factory that strictly takes a text prompt, sends it to the Google SDK, and returns a raw text response. It is the *only* file that knows Gemini exists.
4. **Response Parsing Layer**:
   - `QuestionResponseParser`: Safely extracts JSON from Markdown-formatted AI responses.
   - `QuestionResponseValidator`: Uses `Zod` to rigorously validate that the AI returned the exact schema we demanded (e.g., ensuring `question`, `topic`, and `difficulty` exist).
5. **InterviewSessionService**: The MongoDB persistence layer. It guarantees that if a user refreshes the page, their timer and exact question state are perfectly restored without losing anything.

---

## 4. The Live AI Interview Workflow (How Q&A Flows)

Here is exactly what happens when a candidate clicks "Start Interview":

### 🔹 Step 1: Initialization
1. **Frontend**: Calls `POST /api/interviews/:id/start`.
2. **Backend**: 
   - The `InterviewEngine` builds an initial `PromptContext` using the employer's Job Role and Topics.
   - It sends this prompt to Gemini to generate **Question #1**.
   - An `InterviewSession` is created in MongoDB with Status `ACTIVE`, the countdown timer begins, and Question #1 is saved.
3. **Frontend**: Displays Question #1 to the candidate.

### 🔹 Step 2: The Adaptive Answer Loop
1. **Frontend**: The candidate types their answer and clicks **"Next"**. The button changes to *Generating...* and calls `POST /api/interviews/:id/answer`.
2. **Backend**:
   - The candidate's answer is securely saved to Question #1 in the database.
   - The `InterviewSessionService` dynamically reconstructs the `ConversationHistory` (e.g., "AI asked Q1 -> Candidate answered A1").
   - The `InterviewEngine` builds a **new** `PromptContext` containing the new history and asks Gemini to generate a *follow-up* or *new topic* question based on how well the candidate answered.
   - The new question is saved to the database.
3. **Frontend**: The UI updates to display Question #2, and the loop continues.

### 🔹 Step 3: Resiliency (Refresh Protection)
If the candidate accidentally closes the tab or refreshes the page:
1. **Frontend**: The React hook (`useInterview`) calls `GET /api/interviews/:id/session`.
2. **Backend**: Fetches the active MongoDB session.
3. **Frontend**: Instantly restores the exact active question, their draft text, and computes the exact remaining time using the backend's absolute `expiresAt` timestamp.

### 🔹 Step 4: Submission
1. **Frontend**: Candidate clicks **"Submit Interview"** (or the timer hits zero).
2. **Backend**: Calls `POST /api/interviews/:id/submit`. The MongoDB session is marked as `COMPLETED`.

---

## 5. What is Working Right Now?

If you configure your `.env` with a valid `GEMINI_API_KEY` and start the application today, you can:
1. Log in as an Employer and create a "Senior Node.js Developer" interview.
2. Log in as a Candidate and click "Start Interview".
3. See Gemini generate a real, tailored Node.js question.
4. Type an answer, click Next, and watch Gemini generate a dynamic follow-up question perfectly tailored to your previous answer.
5. Refresh the page at any time and watch the entire state seamlessly restore.
6. Submit the interview.

## 6. What is NOT Implemented Yet (The Next Phase)
- **AI Evaluation & Scoring**: The AI is currently asking questions, but it is not grading the answers. The next phase will introduce the `EvaluationProvider` which will generate a detailed Candidate Scorecard and Feedback Report for the employer.
- **Recording/Video**: No webcam recording is currently implemented.
- **Anti-Cheating**: No tab-switching detection or proctoring features exist yet.
