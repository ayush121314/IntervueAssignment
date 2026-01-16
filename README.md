# Live Polling System

A production-ready, real-time polling application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## 🌟 Features

### Core Functionality
- ✅ **Real-time Polling**: Create and participate in live polls with instant updates
- ✅ **State Recovery**: Polls survive page refreshes - resume exactly where you left off
- ✅ **Timer Synchronization**: Late joiners see accurate remaining time
- ✅ **Vote Integrity**: Server-side validation prevents double voting
- ✅ **Poll History**: View past polls with final results
- ✅ **Live Chat**: Real-time messaging between teachers and students
- ✅ **Participant Management**: Teachers can view and manage active students

### Technical Highlights
- 🏗️ **Clean Architecture**: Controller-Service pattern with strict separation of concerns
- 🔄 **Real-time Updates**: Socket.IO for instant data synchronization
- 💾 **Data Persistence**: MongoDB with Mongoose ODM
- ⏱️ **Server-Owned Timers**: Single source of truth for poll timing
- 🎯 **TypeScript**: Full type safety across frontend and backend
- 🔒 **Data Integrity**: Unique indexes and server-side validation

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally or remote connection)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd IntervueAssignment
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit .env file if needed (default values work for local development)

# Start MongoDB (if running locally)
# mongod

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit .env file if needed (default values work for local development)

# Start the frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

- Open `http://localhost:5173` in your browser
- Choose **Teacher** or **Student** role
- Start creating and participating in polls!

## 📁 Project Structure

```
IntervueAssignment/
├── backend/                    # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── models/            # Mongoose models
│   │   ├── services/          # Business logic layer
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── sockets/           # Socket.IO handlers
│   │   └── server.ts          # Main server file
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React context
│   │   ├── services/          # API service layer
│   │   └── App.tsx
│   ├── .env                   # Environment variables
│   └── package.json
│
└── live_polling_system_fullstack_technical_documentation.md
```

## 🔧 Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/live-polling
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📖 Usage Guide

### For Teachers

1. Select **Teacher** role on the home page
2. Create a poll:
   - Enter your question
   - Add options (minimum 2)
   - Set duration (30-120 seconds)
   - Click "Ask Question"
3. Monitor live results as students vote
4. View poll history anytime

### For Students

1. Select **Student** role on the home page
2. Enter your name
3. Wait for teacher to start a poll
4. Select your answer and submit
5. View live results after voting

## 🏗️ Architecture

### Backend Architecture

- **Routes** → **Controllers** → **Services** → **Database**
- Socket handlers delegate to services (no business logic in handlers)
- Server-side timer service manages poll expiration
- MongoDB with unique indexes for data integrity

### Frontend Architecture

- **Custom Hooks**: `useSocket`, `usePollTimer`, `usePollState`
- **Context API**: Global state management with `PollContext`
- **Service Layer**: Centralized API calls
- **Real-time Updates**: Socket.IO client integration

## 🔄 State Recovery Flow

1. Page loads → Call `GET /api/poll/current`
2. If poll is active → Restore UI with current state
3. Calculate remaining time using server timestamp
4. Check if student already voted
5. Subscribe to real-time updates via Socket.IO

## 🎯 Key Technical Decisions

### Timer Synchronization

```typescript
remainingTime = duration - (now - startedAt)
```

- Server provides `startedAt` timestamp
- Client calculates remaining time locally
- Late joiners automatically see correct time

### Double Vote Prevention

- Unique compound index: `(pollId, studentId)`
- Server validates before accepting votes
- Returns 409 Conflict if already voted

### State Recovery

- Server is single source of truth
- `/api/poll/current` returns complete poll state
- Frontend reconstructs UI from server data

## 📚 API Documentation

See [backend/README.md](backend/README.md) for complete API documentation.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Teacher can create polls
- [ ] Students can vote
- [ ] Real-time updates work
- [ ] Page refresh preserves state
- [ ] Timer synchronization works for late joiners
- [ ] Double voting is prevented
- [ ] Chat functionality works
- [ ] Teacher can kick students
- [ ] Poll history displays correctly

## 🐛 Troubleshooting

### Backend won't start

- Ensure MongoDB is running
- Check if port 5000 is available
- Verify `.env` file exists

### Frontend won't connect

- Ensure backend is running first
- Check CORS settings in backend
- Verify `.env` file has correct API URL

### Socket.IO not connecting

- Check firewall settings
- Verify SOCKET_URL in frontend `.env`
- Check browser console for errors

## 📝 License

MIT

## 🙏 Acknowledgments

Built according to the technical specification in `live_polling_system_fullstack_technical_documentation.md`
