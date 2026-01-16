# Live Polling System – End-to-End Technical Documentation

> **Purpose of this document**  
This document is the **single source of truth** for both **frontend** and **backend** teams.  
A frontend developer can build the complete UI and flows **only using this document + Figma**, and a backend developer can implement the full system **only using this document**.  

The system is designed to be **resilient**, **real-time**, and **state-recoverable**.

---

## 1. High-Level System Overview

### Personas
- **Teacher (Admin)** – Creates and controls polls
- **Student (User)** – Participates in polls

### Core Principles
- Server is the **single source of truth**
- Poll state must survive refreshes
- Real-time updates via **Socket.IO**
- Strict data integrity (no double voting)

---

## 2. Architecture Overview

### Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Realtime | Socket.IO |
| Database | MongoDB |
| Hosting | Any (Render / Railway / Vercel) |

### High-Level Architecture

```
[ React Frontend ]
       |
       | REST (initial state)
       | WebSocket (live updates)
       v
[ Node + Express API ]
       |
       v
[ MongoDB ]
```

---

## 3. Core Domain Models (Database)

### 3.1 Poll Model

```ts
Poll {
  _id: ObjectId
  question: string
  options: Option[]
  duration: number        // seconds
  status: 'ACTIVE' | 'ENDED'
  startedAt: Date         // server timestamp
  endedAt?: Date
  createdBy: 'TEACHER'
}
```

### 3.2 Option Model

```ts
Option {
  _id: ObjectId
  text: string
  voteCount: number
}
```

### 3.3 Vote Model

```ts
Vote {
  _id: ObjectId
  pollId: ObjectId
  studentId: string       // generated per tab/session
  optionId: ObjectId
  votedAt: Date
}
```

### 3.4 Student Session Model (Optional but Recommended)

```ts
StudentSession {
  studentId: string
  name: string
  socketId: string
  joinedAt: Date
  isActive: boolean
}
```

---

## 4. Backend Architecture (Strict Separation of Concerns)

### Folder Structure

```
src/
 ├─ controllers/
 │   ├─ poll.controller.ts
 │   ├─ student.controller.ts
 ├─ services/
 │   ├─ poll.service.ts
 │   ├─ vote.service.ts
 │   ├─ timer.service.ts
 ├─ sockets/
 │   ├─ poll.socket.ts
 │   ├─ chat.socket.ts
 ├─ models/
 ├─ routes/
 ├─ utils/
```

**Rule:**
- Routes → Controllers → Services → DB
- Socket handlers only **delegate**, never implement logic

---

## 5. Backend REST APIs

### 5.1 Get Current Poll State (Resilience API)

**Used on page refresh**

`GET /api/poll/current`

**Response (No active poll)**
```json
{ "status": "IDLE" }
```

**Response (Active poll)**
```json
{
  "status": "ACTIVE",
  "pollId": "...",
  "question": "Which planet is known as the Red Planet?",
  "options": [
    { "id": "1", "text": "Mars", "voteCount": 10 },
    { "id": "2", "text": "Venus", "voteCount": 5 }
  ],
  "startedAt": "2026-01-15T10:00:00Z",
  "duration": 60,
  "serverTime": "2026-01-15T10:00:30Z"
}
```

Frontend calculates remaining time using:
```
remaining = duration - (serverTime - startedAt)
```

---

### 5.2 Create Poll (Teacher)

`POST /api/poll`

```json
{
  "question": "Which planet is known as the Red Planet?",
  "options": ["Mars", "Venus", "Jupiter", "Saturn"],
  "duration": 60
}
```

**Validation Rules**
- No active poll exists
- Previous poll ended OR all students answered

---

### 5.3 Submit Vote (Student)

`POST /api/poll/:pollId/vote`

```json
{
  "studentId": "abc123",
  "optionId": "1"
}
```

**Server Guarantees**
- One vote per student per poll (DB unique index)
- Reject if poll expired

---

### 5.4 Poll History (Teacher)

`GET /api/poll/history`

Returns all completed polls with final results.

---

## 6. Socket.IO Events (Realtime Layer)

### Connection

```ts
io.on('connection', socket => {})
```

---

### Teacher Events

| Event | Direction | Payload |
|-----|---------|--------|
| `poll:start` | Server → All | Poll data |
| `poll:end` | Server → All | Final results |
| `poll:update` | Server → Teacher | Live counts |

---

### Student Events

| Event | Direction | Payload |
|-----|---------|--------|
| `vote:accepted` | Server → Student | Confirmation |
| `vote:rejected` | Server → Student | Error |

---

### Chat Events (Optional)

| Event | Purpose |
|-----|-------|
| `chat:message` | Broadcast messages |

---

## 7. Poll Timer (Server-Owned)

### How Timer Works

1. Poll created → `startedAt = Date.now()`
2. Timer runs **only on server**
3. On expiry → poll marked `ENDED`
4. Emit `poll:end`

**No client-side timer authority**

---

## 8. Frontend Architecture

### Folder Structure

```
src/
 ├─ components/
 ├─ pages/
 ├─ hooks/
 │   ├─ useSocket.ts
 │   ├─ usePollTimer.ts
 │   ├─ usePollState.ts
 ├─ context/
 │   ├─ PollContext.tsx
```

---

## 9. Frontend State Flow (Very Important)

### On App Load (Student / Teacher)

1. Call `GET /api/poll/current`
2. If ACTIVE → restore UI
3. If IDLE → show waiting screen

---

### usePollTimer Hook

```ts
remainingTime = duration - (now - startedAt)
```

- Uses server time
- Recalculates on refresh

---

## 10. Page-by-Page Frontend Behavior (Mapped to Figma)

### 10.1 Role Selection Page
- Choose Student / Teacher

### 10.2 Student Name Entry
- Generate `studentId` (UUID)
- Store in `sessionStorage`

### 10.3 Active Poll Screen

**Before voting**
- Options clickable
- Timer visible

**After voting**
- Disable options
- Show live result bars

### 10.4 Teacher Dashboard
- Create poll form
- Live result bars
- Participants list
- Kick student action

### 10.5 Poll History Page
- Read-only past polls

---

## 11. Resilience Scenarios (Key Evaluation Area)

### Scenario 1: Student Refreshes Page
- Fetch current poll
- Resume timer correctly
- Disable vote if already voted

### Scenario 2: Teacher Refreshes Page
- Poll continues
- Live data restored

### Scenario 3: Late Joiner
- Timer adjusted using `startedAt`

---

## 12. Data Integrity & Security

- DB unique index: `(pollId, studentId)`
- Server-side poll status validation
- Socket events validated via services

---

## 13. Error Handling

| Case | Behavior |
|----|--------|
| DB down | Show toast + retry |
| Socket disconnect | Reconnect + refetch state |
| Vote fail | UI rollback |

---




Assignment Details
Title: Live Polling System





Design Reference
Design Link: https://www.figma.com/design/uhinheFgWssbxvlI7wtf59/Intervue-Assigment--Poll-system?node-id=0-1&t=Y5
Design Preview: (Insert design image screenshot here — ideally from the Figma file for quick reference)
You are required to create a "Resilient Live Polling System" with two personas: Teacher and Student.
Unlike a basic todo-list app, this system must handle state recovery. If a teacher refreshes their browser mid-poll, the poll should not disappear. If a student joins 30 seconds late to a 60-second question, their timer must start at 30 seconds, not 60.


Technology Stack
Frontend: React.js (Hooks required; Redux/Context API optional but preferred).
Backend: Node.js with Express.
Real-time Communication: Socket.io.
Database: MongoDB 
Languages: TypeScript



Functional Requirements
Teacher Persona (Admin)
Poll Creation: Ability to create a question with options and a timer duration (e.g., 60 seconds).
Live Dashboard: View real-time updates as students submit votes (e.g., "Option A: 40%, Option B: 60%").
Poll History (DB Integration): View a list of previously conducted polls and their final aggregate results, fetched from the database.
Create a new poll
View live polling results
Ask a new question only if:
No question has been asked yet, or
Time had ended
All students have answered the previous question
Student Persona (User)
Onboarding: Enter a name on the first visit (unique per session/tab).
Real-time Interaction: Receive the question instantly when the teacher asks it.
Timer Synchronization: The timer must remain in sync with the server.
Scenario: If the time limit is 60s and a student joins 10 seconds late, their timer must show 50s, not 60s.
Voting: Submit an answer within the time limit.
Enter name on first visit (unique to each tab)
Submit answers once a question is asked
View live polling results after submission
Maximum of 60 seconds to answer a question, after which results are shown
System Behavior (The "Resilience" Factor)
State Recovery: If the Teacher or Student refreshes the page during an active poll, the application must fetch the current state from the backend and resume the UI exactly where it left off.
Race Conditions: Ensure that a student cannot vote more than once per question, even if they spam the API or manipulate the client-side code.



Code Quality & Architecture Standards
We place a high value on clean, maintainable code. Your submission will be evaluated on the following strict criteria:
Backend Architecture (Separation of Concerns)
Do not write business logic directly inside Socket listeners or Express routes.
Use a Controller-Service pattern.
Example: PollSocketHandler.js handles the connection, while PollService.js handles the logic and DB interaction.
Frontend Architecture
Use Custom Hooks (e.g., useSocket, usePollTimer) to separate logic from UI components.
Implement Optimistic UI updates where appropriate (UI updates immediately, reverts on error).
Error Handling
The app should not crash if the database is temporarily unreachable.
Provide user feedback (toasts/alerts) for connection errors or submission failures.
 Data Integrity
Use the Database to persist Polls, Options, and Votes.
Ensure the server is the "Source of Truth" for the timer and vote counts.

Must-Have Requirements
Functional system with all core features working
Hosting for both frontend and backend
Teacher can create polls and students can answer them
Both teacher and student can view poll results
Please ensure the UI in your assignment submission follows the shared Figma design without any deviations.
Good to Have
Configurable poll time limit by teacher
Option for teacher to remove a student
Well-designed user interface
System behavior (The "Resilience" Factor)
Bonus Features (Brownie Points)
Chat popup for interaction between students and teachers
Teacher can view past poll results (not stored locally)