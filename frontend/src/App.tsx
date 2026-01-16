import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PollProvider } from './context/PollContext';
import { SocketProvider } from './context/SocketContext';
import RoleSelection from './pages/RoleSelection';
import StudentEntry from './pages/StudentEntry';
import StudentPoll from './pages/StudentPoll';
import TeacherDashboard from './pages/TeacherDashboard';
import PollHistory from './pages/PollHistory';

const App: React.FC = () => {
  return (
    <SocketProvider>
      <PollProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/student/join" element={<StudentEntry />} />
            <Route path="/student/poll" element={<StudentPoll />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/history" element={<PollHistory />} />
          </Routes>
        </BrowserRouter>
      </PollProvider>
    </SocketProvider>
  );
};

export default App;

