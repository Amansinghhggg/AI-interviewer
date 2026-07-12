# 📦 Dependencies

## Frontend (Phase 1)

### Install

```bash
npm install react-router-dom axios react-hook-form zod @hookform/resolvers react-hot-toast lucide-react tailwindcss @tailwindcss/vite
```

### Purpose

| Package               | Purpose                           |
| --------------------- | --------------------------------- |
| `react-router-dom`    | Client-side routing               |
| `axios`               | API requests                      |
| `react-hook-form`     | Form management                   |
| `zod`                 | Form validation                   |
| `@hookform/resolvers` | Connects Zod with React Hook Form |
| `react-hot-toast`     | Toast notifications               |
| `lucide-react`        | Modern icon library               |
| `tailwindcss`         | Utility-first CSS framework       |
| `@tailwindcss/vite`   | Tailwind integration for Vite     |

---

## Backend (Phase 1)

### Install

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken cookie-parser zod
```

### Development Dependency

```bash
npm install -D nodemon
```

### Purpose

| Package         | Purpose                         |
| --------------- | ------------------------------- |
| `express`       | Backend framework               |
| `mongoose`      | MongoDB ODM                     |
| `cors`          | Enable cross-origin requests    |
| `dotenv`        | Environment variable management |
| `bcryptjs`      | Password hashing                |
| `jsonwebtoken`  | JWT authentication              |
| `cookie-parser` | Parse HTTP cookies              |
| `zod`           | Request validation              |
| `nodemon`       | Auto-restart development server |

---

## 📌 Phase 1 Scope

Focus only on:

* User Authentication (Employer & Candidate)
* JWT Authentication (HTTP-only Cookies)
* Role-Based Authorization
* Protected Routes
* Dashboard UI
* Create Interview (Basic UI)
* MongoDB Integration

**Do NOT install yet:**

* Socket.IO
* Redis
* BullMQ
* Cloudinary
* AI SDKs (Gemini/OpenAI)
* React Webcam
* MediaPipe
* Recharts
* Framer Motion

These will be added in later phases as the project grows.
