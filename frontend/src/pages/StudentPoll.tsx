import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollContext } from '../context/PollContext';
import { useSocket } from '../hooks/useSocket';
import { usePollState } from '../hooks/usePollState';
import { usePollTimer } from '../hooks/usePollTimer';
import apiService from '../services/api';
import ChatWidget from '../components/ChatWidget';
import './StudentPoll.css';

const StudentPoll: React.FC = () => {
    const navigate = useNavigate();
    const { studentInfo, hasVoted, setHasVoted, setVotedOptionId } = usePollContext();
    const { socket, isConnected } = useSocket();
    const { pollState, loading } = usePollState(socket);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isKicked, setIsKicked] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { formattedTime, isExpired } = usePollTimer({
        startedAt: pollState.status === 'ACTIVE' ? pollState.startedAt || null : null,
        duration: pollState.duration || 0,
        serverTime: pollState.serverTime
    });

    // Redirect if no student info
    useEffect(() => {
        if (!studentInfo) {
            navigate('/student/join');
        }
    }, [studentInfo, navigate]);

    // Server as Source of Truth: Check if already kicked on mount
    useEffect(() => {
        const verifyKickedStatus = async () => {
            if (studentInfo) {
                try {
                    const response = await apiService.validateStudentSession(studentInfo.id);
                    if (!response.valid) {
                        setIsKicked(true);
                    }
                } catch (error: any) {
                    // If 403 (Kicked), show kicked screen
                    if (error.response?.status === 403) {
                        setIsKicked(true);
                    } else if (error.response?.status === 404) {
                        // If not found, clear and redirect to join
                        navigate('/student/join');
                    }
                }
            }
        };
        verifyKickedStatus();
    }, [studentInfo, navigate]);

    // Register student via socket
    useEffect(() => {
        if (socket && isConnected && studentInfo) {
            socket.emit('student:join', {
                studentId: studentInfo.id,
                name: studentInfo.name
            });
        }
    }, [socket, isConnected, studentInfo]);

    // Listen for kick event
    useEffect(() => {
        if (!socket) return;

        const handleStudentKicked = () => {
            setIsKicked(true);
        };

        socket.on('student:kicked', handleStudentKicked);

        return () => {
            socket.off('student:kicked', handleStudentKicked);
        };
    }, [socket]);

    // Check if student already voted when poll loads
    useEffect(() => {
        const checkVoteStatus = async () => {
            if (pollState.status === 'ACTIVE' && pollState.pollId && studentInfo) {
                try {
                    const { hasVoted: voted, vote } = await apiService.checkVoteStatus(
                        pollState.pollId,
                        studentInfo.id
                    );
                    setHasVoted(voted);
                    if (vote) {
                        setVotedOptionId(vote.optionId);
                    }
                } catch (error) {
                    console.error('Error checking vote status:', error);
                }
            }
        };

        checkVoteStatus();
    }, [pollState.pollId, pollState.status, studentInfo, setHasVoted, setVotedOptionId]);

    const handleSubmit = async () => {
        if (!selectedOption || !pollState.pollId || !studentInfo) return;

        setSubmitting(true);
        try {
            await apiService.submitVote(pollState.pollId, studentInfo.id, selectedOption);
            setHasVoted(true);
            setVotedOptionId(selectedOption);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to submit vote');
        } finally {
            setSubmitting(false);
        }
    };

    if (isKicked) {
        return (
            <div className="student-poll-container centered-view">
                <div className="brand-badge"><span>✨</span> Intervue Poll</div>
                <h1 className="kicked-title">You've been Kicked out !</h1>
                <p className="subtitle">Looks like the teacher had removed you from the poll system. Please try again sometime.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="student-poll-container centered-view">
                <div className="brand-badge"><span>✨</span> Intervue Poll</div>
                <div className="loader-spinner"></div>
                <h2 className="waiting-text">Loading...</h2>
            </div>
        );
    }

    if (pollState.status === 'IDLE' || !pollState.pollId) {
        return (
            <div className="student-poll-container centered-view">
                <div className="brand-badge"><span>✨</span> Intervue Poll</div>
                <div className="loader-spinner"></div>
                <h2 className="waiting-text">Wait for the teacher to ask questions..</h2>
                <ChatWidget role="STUDENT" />
            </div>
        );
    }

    // Determine if we should show results: 
    // Show results if student has voted OR if poll has ended
    if (hasVoted || pollState.status === 'ENDED') {
        const isPollEnded = pollState.status === 'ENDED';

        return (
            <div className="student-poll-container">
                <div className="poll-header-row">
                    <span className="q-number">Question</span>
                    <span className={`timer ${(isExpired || isPollEnded) ? 'expired' : ''}`}>
                        {isPollEnded
                            ? `RESULTS CLOSING IN ${pollState.resultsRemaining || 0}s`
                            : `⏱ ${formattedTime}`
                        }
                    </span>
                </div>

                <div className="question-card">
                    <div className="question-text-box">
                        {pollState.question}
                    </div>

                    <div className="results-list">
                        {pollState.options?.map((opt, idx) => {
                            const total = pollState.options?.reduce((sum, o) => sum + o.voteCount, 0) || 1;
                            const percent = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;

                            return (
                                <div key={opt.id} className="result-row">
                                    <div className={`result-bar-bg ${opt.isCorrect && isPollEnded ? 'correct-bar' : ''}`}>
                                        <div className="result-bar-fill" style={{ width: `${percent}%` }}></div>
                                        <div className="result-content">
                                            <div className="opt-marker">
                                                {opt.isCorrect && isPollEnded ? '✅' : idx + 1}
                                            </div>
                                            <span className="opt-text">{opt.text}</span>
                                            <span className="opt-percent">{percent}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="waiting-footer-text">Wait for the teacher to ask a new question..</p>
                <ChatWidget role="STUDENT" />
            </div>
        );
    }

    return (
        <div className="student-poll-container">
            <div className="poll-header-row">
                <span className="q-number">Question</span>
                <span className="timer">⏱ {formattedTime}</span>
            </div>

            <div className="question-card">
                <div className="question-text-box">
                    {pollState.question}
                </div>

                <div className="options-list-active">
                    {pollState.options?.map((opt, idx) => (
                        <label
                            key={opt.id}
                            className={`option-label ${selectedOption === opt.id ? 'selected' : ''}`}
                        >
                            <div className="opt-col-left">
                                <div className="opt-marker-active">{idx + 1}</div>
                                <span className="opt-text">{opt.text}</span>
                            </div>
                            <input
                                type="radio"
                                name="poll-option"
                                value={opt.id}
                                checked={selectedOption === opt.id}
                                onChange={() => setSelectedOption(opt.id)}
                                className="hidden-radio"
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="poll-footer">
                <button
                    className="submit-vote-btn"
                    disabled={!selectedOption || submitting}
                    onClick={handleSubmit}
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>

            <ChatWidget role="STUDENT" />
        </div>
    );
};

export default StudentPoll;
