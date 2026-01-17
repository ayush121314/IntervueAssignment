# 🚀 Live Polling System

A production-ready, real-time polling application built with the **MERN** stack and **Socket.IO**. Designed for resilience, scalability, and a seamless multi-user experience.

---

## 🌟 Features Overview

---

## 👨‍🏫 Teacher Persona (Host)

- Create live polls with multiple options
- Mark **correct answers** for evaluation
- View **live vote progress** with percentage breakdown
- Automatic **All Voted** detection
- Ability to **kick students** from a session
- View poll history with analytics and performance insights
- Can send messages to all students through chat

---

## 🎓 Student Persona (Participant)

- Join live sessions instantly
- Vote exactly **once per poll** (server-enforced)
- Automatic state recovery after refresh or reconnect
- Persistent **Kicked** state if removed by teacher
- Can send messages to everyone through chat
- See live progress bar and result after poll
- Join mid-way during an active poll

---

## 🛠️ Technical Resilience

- Atomic voting logic (prevents double voting)
- Race-condition safe backend logic
- Server-authoritative timers (late joiners see correct countdown)
- Modular backend services:
  - Poll Service
  - Vote Service
  - Chat Service
  - Timer Service
  - Participant Service

---

## 💻 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Socket.IO Client

### Backend
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Socket.IO

---

## 🚀 Getting Started

This project can be run using **three supported methods**:

1. Manual Setup (Local Development)
2. Docker Compose (Local)
3. Production / EC2 Deployment (Docker Compose)

---

## 1️⃣ Manual Setup (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas

---

### Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/ayush121314/IntervueAssignment
cd IntervueAssignment
```

#### 2. Backend Setup

```bash
cd backend
```

- Create `.env` using `backend/.env.example`
- Install dependencies and start the server:

```bash
npm install
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
```

- Create `.env` using `frontend/.env.example`
- Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

---

## 2️⃣ Docker Compose (Local)

Runs the entire application locally using Docker.

### Steps

1. Ensure Docker is running
2. Create `backend/.env` using `backend/.env.example`
3. Run:

```bash
docker-compose -f docker-compose-local.yml up --build
```

### Access

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000

---

## 3️⃣ Production / EC2 Deployment

Intended for cloud deployment using a managed MongoDB cluster.

### Steps

1. Create `backend/.env` using `backend/.env.example` and update production values
2. Run:

```bash
docker-compose up --build -d
```

⚠️ **Note:** If the server IP or domain changes, update the frontend build arguments in `docker-compose.yml` and rebuild.

---

## 🧪 Verification & Testing Checklist

- Real-time updates across multiple clients
- State persistence on refresh
- Late joiner timer synchronization
- Double voting prevention
- Kick propagation in real time
- Live chat message sync

---

## 📌 Notes

- `.env.example` files are provided for both frontend and backend
- Actual `.env` files must never be committed
- All configuration is environment-driven
- Designed to be production-ready and cloud-agnostic

---

## 👨‍💻 Author

**Ayush**

- GitHub: [@ayush121314](https://github.com/ayush121314)

---