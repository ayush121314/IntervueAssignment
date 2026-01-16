# Live Polling System - Backend

Production-ready backend for the live polling system built with Node.js, Express, TypeScript, Socket.IO, and MongoDB.

## Features

- ✅ RESTful API for poll management
- ✅ Real-time updates via Socket.IO
- ✅ MongoDB database with Mongoose ODM
- ✅ Server-side timer management
- ✅ Vote validation and duplicate prevention
- ✅ Student session management
- ✅ Chat functionality
- ✅ State recovery support

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or connection URI)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/live-polling
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Poll Management

- `GET /api/poll/current` - Get current active poll state
- `POST /api/poll` - Create a new poll (Teacher)
- `GET /api/poll/history` - Get poll history

### Voting

- `POST /api/poll/:pollId/vote` - Submit a vote
- `GET /api/poll/:pollId/vote/status` - Check if student has voted

### Health Check

- `GET /health` - Server health status

## Socket.IO Events

### Client → Server

- `student:join` - Student joins the system
- `vote:submit` - Submit a vote (alternative to REST)
- `student:kick` - Teacher kicks a student
- `poll:start` - Broadcast poll start
- `chat:message` - Send chat message
- `chat:getHistory` - Request chat history

### Server → Client

- `poll:start` - New poll started
- `poll:end` - Poll ended
- `poll:update` - Live vote count updates
- `vote:accepted` - Vote accepted confirmation
- `vote:rejected` - Vote rejected with error
- `student:kicked` - Student was kicked
- `participants:update` - Updated participants list
- `chat:message` - New chat message
- `chat:history` - Chat history

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── models/
│   │   ├── Poll.ts              # Poll model
│   │   ├── Vote.ts              # Vote model
│   │   ├── StudentSession.ts    # Student session model
│   │   └── ChatMessage.ts       # Chat message model
│   ├── services/
│   │   ├── poll.service.ts      # Poll business logic
│   │   ├── vote.service.ts      # Vote business logic
│   │   ├── student.service.ts   # Student management
│   │   ├── chat.service.ts      # Chat management
│   │   └── timer.service.ts     # Server-side timers
│   ├── controllers/
│   │   ├── poll.controller.ts   # Poll REST handlers
│   │   └── vote.controller.ts   # Vote REST handlers
│   ├── routes/
│   │   ├── poll.routes.ts       # Poll routes
│   │   └── vote.routes.ts       # Vote routes
│   ├── sockets/
│   │   ├── poll.socket.ts       # Poll socket handlers
│   │   └── chat.socket.ts       # Chat socket handlers
│   └── server.ts                # Main server file
├── package.json
├── tsconfig.json
└── .env
```

## Architecture

The backend follows a strict **Controller-Service** pattern:

- **Routes** → Define API endpoints
- **Controllers** → Handle HTTP requests/responses
- **Services** → Contain business logic and database operations
- **Socket Handlers** → Delegate to services, emit events
- **Models** → Define database schemas

## Key Features

### State Recovery

The `/api/poll/current` endpoint returns the current poll state including:
- Poll question and options
- Current vote counts
- Server timestamp for timer synchronization
- Poll status (ACTIVE/IDLE)

### Timer Synchronization

- Server maintains the single source of truth for time
- Returns `startedAt` and `serverTime` for client-side calculation
- Automatically ends polls when timer expires

### Data Integrity

- Unique compound index on `(pollId, studentId)` prevents double voting
- Server-side validation for all operations
- Poll status checks before accepting votes

## License

MIT
