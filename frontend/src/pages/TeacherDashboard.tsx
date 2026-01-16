import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { usePollState } from '../hooks/usePollState';
import { usePollTimer } from '../hooks/usePollTimer';
import apiService from '../services/api';
import ChatWidget from '../components/ChatWidget';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { pollState, refetch } = usePollState(socket);

    const [question, setQuestion] = useState('');
    const [duration, setDuration] = useState('60');
    const [options, setOptions] = useState([
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false }
    ]);
    const [creating, setCreating] = useState(false);

    const { formattedTime } = usePollTimer({
        startedAt: pollState.status === 'ACTIVE' ? pollState.startedAt || null : null,
        duration: pollState.duration || 0,
        serverTime: pollState.serverTime
    });

    const hasActivePoll = pollState.status === 'ACTIVE';

    const handleOptionChange = (id: number, field: 'text' | 'isCorrect', value: string | boolean) => {
        setOptions(options.map(opt => {
            if (opt.id === id) {
                return { ...opt, [field]: value };
            }
            return opt;
        }));
    };

    const addOption = () => {
        setOptions([...options, { id: Date.now(), text: '', isCorrect: false }]);
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) {
            alert('Please enter a question');
            return;
        }

        const validOptions = options.filter(opt => opt.text.trim());
        if (validOptions.length < 2) {
            alert('Please provide at least 2 options');
            return;
        }

        setCreating(true);
        try {
            const pollData = await apiService.createPoll({
                question: question.trim(),
                options: validOptions.map(opt => opt.text.trim()),
                duration: parseInt(duration)
            });

            // Emit poll:start event via socket
            if (socket) {
                socket.emit('poll:start', {
                    pollId: pollData.pollId,
                    question: pollData.question,
                    options: pollData.options,
                    startedAt: pollData.startedAt,
                    duration: pollData.duration
                });
            }

            // Refetch poll state
            await refetch();

            // Reset form
            setQuestion('');
            setOptions([
                { id: 1, text: '', isCorrect: false },
                { id: 2, text: '', isCorrect: false }
            ]);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create poll');
        } finally {
            setCreating(false);
        }
    };

    const handleViewHistory = () => {
        navigate('/teacher/history');
    };

    return (
        <div className="teacher-dashboard-container">
            <div className="brand-badge"><span>✨</span> Intervue Poll</div>

            {!hasActivePoll ? (
                /* Poll Creation View */
                <div className="creation-view">
                    <div className="header-section">
                        <h1 className="title">Let's Get Started</h1>
                        <p className="subtitle">
                            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                        </p>
                    </div>

                    <div className="poll-form">
                        <div className="form-group">
                            <div className="label-row">
                                <label className="input-label">Enter your question</label>
                                <select
                                    className="duration-select"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                >
                                    <option value="30">30 seconds</option>
                                    <option value="60">60 seconds</option>
                                    <option value="90">90 seconds</option>
                                    <option value="120">120 seconds</option>
                                </select>
                            </div>
                            <textarea
                                className="question-input"
                                placeholder="Type your question here..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                maxLength={200}
                            />
                            <div className="char-count">{question.length}/200</div>
                        </div>

                        <div className="options-section">
                            <div className="options-header">
                                <span className="label-text">Edit Options</span>
                                <span className="label-text">Is it Correct?</span>
                            </div>

                            <div className="options-list">
                                {options.map((opt, index) => (
                                    <div key={opt.id} className="option-row">
                                        <div className="option-index">{index + 1}</div>
                                        <input
                                            type="text"
                                            className="option-input"
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(opt.id, 'text', e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                        />

                                        <div className="correct-toggle">
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name={`correct-${opt.id}`}
                                                    checked={opt.isCorrect}
                                                    onChange={() => handleOptionChange(opt.id, 'isCorrect', true)}
                                                />
                                                Yes
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name={`correct-${opt.id}`}
                                                    checked={!opt.isCorrect}
                                                    onChange={() => handleOptionChange(opt.id, 'isCorrect', false)}
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="add-option-btn" onClick={addOption}>
                                + Add More option
                            </button>
                        </div>

                        <div className="form-footer">
                            <button
                                className="ask-question-btn"
                                onClick={handleAskQuestion}
                                disabled={creating}
                            >
                                {creating ? 'Creating...' : 'Ask Question'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Live Monitor View */
                <div className="live-view">
                    <div className="live-header-actions">
                        <button className="view-history-btn" onClick={handleViewHistory}>
                            👁 View Poll history
                        </button>
                    </div>

                    <div className="question-card">
                        <div className="question-header">
                            <span className="q-label">Question</span>
                            <span className="timer">⏱ {formattedTime}</span>
                        </div>

                        <div className="question-text-box">
                            {pollState.question}
                        </div>

                        <div className="results-list">
                            {pollState.options?.map((opt, idx) => {
                                const total = pollState.options?.reduce((sum, o) => sum + o.voteCount, 0) || 1;
                                const percent = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;

                                return (
                                    <div key={opt.id} className="result-row">
                                        <div className="result-bar-bg">
                                            <div
                                                className="result-bar-fill"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                            <div className="result-content">
                                                <div className="opt-marker">{idx + 1}</div>
                                                <span className="opt-text">{opt.text}</span>
                                                <span className="opt-percent">{percent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="live-footer">
                        <p className="waiting-text">Poll is active. Results update in real-time.</p>
                    </div>
                </div>
            )}

            <ChatWidget role="TEACHER" />
        </div>
    );
};

export default TeacherDashboard;
