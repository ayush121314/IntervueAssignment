# 🚀 Live Polling System

A production-ready, real-time polling application built with the **MERN** stack and **Socket.IO**. Designed for resilience, scalability, and a seamless user experience.

---

## 🌟 Key Features

### 👨‍🏫 Teacher Persona
- **Advanced Poll Creation**: Create polls with multiple options and designate **correct answers** for educational tracking.
- **Smart Monitoring**: Real-time progress bars with an **All Voted** detection system that enables poll closure only when every active student has participated.
- **Session Governance**: A live **Participant Roster** with the ability to **kick disruptive students** instantly.
- **Rich Analytics**: A dedicated history view showcasing card-based results, percentage distributions, and performance highlights.

### 🎓 Student Persona
- **Integrated Social Features**: A floating **Live Chat** widget with real-time message history and a participant list.
- **Dynamic UI States**: Seamless transition between "Waiting", "Voting", and "Result" modes with instant server-driven feedback.
- **Governance Safeguards**: Instant feedback if removed from a session, with persistent "Kicked" state tracking.
- **State Persistence**: Automatic re-sync of active polls and personal vote status, even after accidental browser crashes.

### 🛠️ Technical Resilience
- **Atomic Operations**: Backend logic designed to prevent double-voting and race conditions during high-concurrency sessions.
- **Server-Authoritative Timers**: Single source of truth for poll duration, ensuring late joiners see the exact same countdown as others.
- **Modular Service Layer**: Clean separation of concerns (Chat, Student, Vote, and Timer services) for high maintainability.

---

## 💻 Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

---

## 🚀 Getting Started

You can run this project in three ways: **Manually**, **Locally via Docker (Zero-Config)**, or **Production/EC2 via Docker**.

### 1️⃣ Manual Setup (Local Development)

#### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

#### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/ayush121314/IntervueAssignment
   cd IntervueAssignment
   ```

2. **Backend Configuration**
   - Navigate to `backend/`
   - Create `.env` based on `.env.example`:
     ```env
     PORT=4000
     MONGO_URI=mongodb://localhost:27017/polling_db
     NODE_ENV=development
     ```
   - Install & Run:
     ```bash
     npm install
     npm run dev
     ```

3. **Frontend Configuration**
   - Navigate to `frontend/`
   - Create `.env` based on `.env.example`:
     ```env
     VITE_API_URL=http://localhost:4000
     VITE_SOCKET_URL=http://localhost:4000
     ```
   - Install & Run:
     ```bash
     npm install
     npm run dev
     ```

---

### 2️⃣ Docker Compose Local (Zero-Config)
This is the fastest way to get everything running locally with an internal MongoDB container.

1. **Ensure Docker is running.**
2. **Run the local compose file:**
   ```bash
   docker-compose -f docker-compose-local.yml up --build
   ```
3. **Access the application:**
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend**: [http://localhost:4000](http://localhost:4000)
   - **MongoDB**: Internal to Docker (no setup required).

---

### 3️⃣ Production / EC2 Deployment
Use this for deploying to a cloud server like EC2 where you might use a managed MongoDB (like Atlas) or want specific IP bindings.

1. **Prepare Environment Variables**
   - Configure `backend/.env` with your production `MONGO_URI`.
2. **Run Docker Compose:**
   ```bash
   docker-compose up --build -d
   ```
   > [!IMPORTANT]
   > The `docker-compose.yml` is configured with specific build arguments for API and Socket URLs. Make sure to update the IP/Domain in the `args` section of `docker-compose.yml` if your server IP changes.

---

## 🧪 Verification & Testing

> [!NOTE]
> The application includes a comprehensive manual testing checklist to ensure all resilience features are operational.

- [x] **Real-time Sync**: Open two browser windows to witness instant updates.
- [x] **State Persistence**: Refresh the browser during an active poll.
- [x] **Late Joining**: Join a poll halfway through to see synchronized timers.
- [x] **Integrity**: Attempt to vote twice with the same student ID.

---
