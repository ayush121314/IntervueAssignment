import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollContext } from '../context/PollContext';
import './StudentEntry.css';
import { nanoid } from 'nanoid';
import { useSocket } from '../hooks/useSocket';
import apiService from '../services/api';
const StudentEntry: React.FC = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const { setStudentInfo } = usePollContext();

    // Session check is now handled by PublicStudentRoute
    // We just render the form if we are allowed to be here.

    const { socket } = useSocket();

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Generate UUID for student
        const studentId = nanoid();

        try {
            // Register on backend first (requires socketId)
            // If socket isn't connected yet, we might have an issue. 
            // Usually it connects quickly.
            const currentSocketId = socket?.id || 'HTTP_INIT_' + nanoid(); // Fallback if race? 
            // Ideally we wait for socket? But let's try strict.

            await apiService.registerStudent(studentId, name.trim(), currentSocketId);

            // Store in context (which also stores in sessionStorage)
            setStudentInfo({
                id: studentId,
                name: name.trim()
            });

            navigate('/student/poll');
        } catch (error) {
            console.error('Registration failed:', error);
            // Handle Kicked or other errors?
        }
    };

    return (
        <div className="student-entry-container">
            <div className="brand-badge">
                <span>✨</span> Intervue Poll
            </div>

            <h1 className="title">Let's Get Started</h1>
            <p className="subtitle">
                If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
            </p>

            <form className="entry-form" onSubmit={handleContinue}>
                <div className="form-group">
                    <label htmlFor="studentName" className="input-label">Enter your Name</label>
                    <input
                        type="text"
                        id="studentName"
                        className="text-input"
                        placeholder="Rahul Bajaj"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="continue-button full-width"
                    disabled={!name.trim()}
                >
                    Continue
                </button>
            </form>
        </div>
    );
};

export default StudentEntry;
