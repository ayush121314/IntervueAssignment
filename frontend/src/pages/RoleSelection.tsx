import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

import { usePollContext } from '../context/PollContext';
import apiService from '../services/api';

const RoleSelection: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | null>(null);
    const navigate = useNavigate();
    const { studentInfo, setStudentInfo } = usePollContext();

    // Enforce Server Source of Truth: Redirect valid existing students to the poll
    React.useEffect(() => {
        const verifySession = async () => {
            if (studentInfo) {
                try {
                    const response = await apiService.validateStudentSession(studentInfo.id);
                    if (response.valid) {
                        navigate('/student/poll');
                    } else {
                        setStudentInfo(null);
                    }
                } catch (error) {
                    setStudentInfo(null);
                }
            }
        };
        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleContinue = () => {
        if (selectedRole === 'STUDENT') {
            navigate('/student/join');
        } else if (selectedRole === 'TEACHER') {
            navigate('/teacher/dashboard');
        }
    };

    return (
        <div className="role-selection-container">
            <div className="brand-badge">
                <span>✨</span> Intervue Poll
            </div>

            <h1 className="title">Welcome to the Live Polling System</h1>
            <p className="subtitle">
                Please select the role that best describes you to begin using the live polling system
            </p>

            <div className="cards-container">
                <div
                    className={`role-card ${selectedRole === 'STUDENT' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('STUDENT')}
                >
                    <h2 className="role-title">I'm a Student</h2>
                    <p className="role-description">
                        Participate in live polls, submit your answers, and view results in real-time.
                    </p>
                </div>

                <div
                    className={`role-card ${selectedRole === 'TEACHER' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('TEACHER')}
                >
                    <h2 className="role-title">I'm a Teacher</h2>
                    <p className="role-description">
                        Create and manage polls, view live participation, and analyze student results.
                    </p>
                </div>
            </div>

            <button
                className="continue-button"
                disabled={!selectedRole}
                onClick={handleContinue}
            >
                Continue
            </button>
        </div>
    );
};

export default RoleSelection;
