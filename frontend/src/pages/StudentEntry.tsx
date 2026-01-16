import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentEntry.css';

const StudentEntry: React.FC = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Generate UUID if not exists or just generate new one for new session?
        // Doc says: "Generate studentId (UUID) -> Store in sessionStorage"
        const studentId = crypto.randomUUID();

        sessionStorage.setItem('studentId', studentId);
        sessionStorage.setItem('studentName', name.trim());

        navigate('/student/poll');
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
