import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollState } from '../hooks/usePollState';
import { usePollTimer } from '../hooks/usePollTimer';
import apiService from '../services/api';
import ChatWidget from '../components/ChatWidget';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
    const { socket, isConnected } = useSocket();
    const { pollState, refetch } = usePollState(socket);

    const [question, setQuestion] = useState('');
    const [duration, setDuration] = useState('60');
    const [options, setOptions] = useState([
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false }
    ]);
    const [creating, setCreating] = useState(false);
    const [view, setView] = useState<'CREATE' | 'MONITOR' | 'HISTORY'>('CREATE');
    const [participants, setParticipants] = useState<any[]>([]);
    const [pollHistory, setPollHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const { formattedTime } = usePollTimer({
        startedAt: pollState.status === 'ACTIVE' ? pollState.startedAt || null : null,
        duration: pollState.duration || 0,
        serverTime: pollState.serverTime
    });

    // Listen for participant updates to check if everyone has voted
    React.useEffect(() => {
        if (!socket) return;

        const handleParticipantsUpdate = (data: any[]) => {
            setParticipants(data);
        };

        socket.on('participants:update', handleParticipantsUpdate);

        return () => {
            socket.off('participants:update', handleParticipantsUpdate);
        };
    }, [socket]);

    React.useEffect(() => {
        if (socket && isConnected) {
            socket.emit('participants:get');
        }
    }, [socket, isConnected]);

    const hasActivePoll = pollState.status === 'ACTIVE';
    const totalVotes = pollState.options?.reduce((sum, opt) => sum + opt.voteCount, 0) || 0;
    const activeParticipants = participants.length;
    const allVoted = activeParticipants === 0 || totalVotes >= activeParticipants;

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
                options: validOptions.map(opt => ({
                    text: opt.text.trim(),
                    isCorrect: opt.isCorrect
                })),
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
            setView('MONITOR');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create poll');
        } finally {
            setCreating(false);
        }
    };

    const handleEndPoll = () => {
        if (socket && pollState.pollId) {
            if (confirm('Are you sure you want to end this poll?')) {
                socket.emit('poll:end', { pollId: pollState.pollId });
                // We don't need to refetch manually, poll:end event from server will update us
            }
        }
    };

    const handleViewHistory = async () => {
        setView('HISTORY');
        setLoadingHistory(true);
        try {
            const history = await apiService.getPollHistory();
            setPollHistory(history);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="teacher-dashboard-container">
            <div className="brand-badge"><span>✨</span> Intervue Poll</div>

            {hasActivePoll ? (
                /* Live Monitor View */
                <div className="live-view">
                    {/* View Poll history hidden during active poll as per request */}

                    <div className="question-card">
                        <div className="question-header">
                            <span className="q-label">Question</span>
                            <span className="timer">
                                {pollState.status === 'ENDED'
                                    ? `RESULTS CLOSING IN ${pollState.resultsRemaining || 0}s`
                                    : `⏱ ${formattedTime}`
                                }
                            </span>
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
                                        <div className={`result-bar-bg ${opt.isCorrect ? 'correct-bar' : ''}`}>
                                            <div
                                                className={`result-bar-fill ${opt.isCorrect ? 'correct-fill' : ''}`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                            <div className="result-content">
                                                <div className="opt-marker">
                                                    {opt.isCorrect ? '✅' : idx + 1}
                                                </div>
                                                <span className={`opt-text ${opt.isCorrect ? 'correct-text' : ''}`}>
                                                    {opt.text}
                                                </span>
                                                <span className="opt-percent">{percent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="live-footer">
                        <div className="end-poll-wrapper">
                            <button
                                className="end-poll-btn"
                                onClick={handleEndPoll}
                                disabled={!allVoted}
                                title={!allVoted ? "Waiting for all students to vote..." : ""}
                            >
                                End Poll
                            </button>
                            {!allVoted && (
                                <span className="wait-warning">
                                    (Waiting for all {activeParticipants} students to vote)
                                </span>
                            )}
                        </div>
                        <p className="waiting-text">Poll is active. Results update in real-time.</p>
                    </div>
                </div>
            ) : view === 'HISTORY' ? (
                /* Poll History View */
                <div className="history-view">
                    <div className="history-header">
                        <h2 className="section-title">Poll History</h2>
                        <button className="back-btn" onClick={() => setView('CREATE')}>
                            ← Back to Dashboard
                        </button>
                    </div>

                    {loadingHistory ? (
                        <div className="history-loading">Loading history...</div>
                    ) : pollHistory.length === 0 ? (
                        <div className="no-history">No polls found in history.</div>
                    ) : (
                        <div className="history-list">
                            {pollHistory.map((poll, pIdx) => (
                                <div key={poll.id} className="history-item-container">
                                    <h3 className="history-question-label">Question {pIdx + 1}</h3>
                                    <div className="history-card">
                                        <div className="history-card-header">
                                            <p>{poll.question}</p>
                                        </div>
                                        <div className="history-results">
                                            {poll.options.map((opt: any, idx: number) => {
                                                const total = poll.options.reduce((sum: number, o: any) => sum + o.voteCount, 0) || 1;
                                                const percent = Math.round((opt.voteCount / total) * 100);
                                                return (
                                                    <div key={opt.id} className="history-result-row">
                                                        <div className={`history-bar-bg ${opt.isCorrect ? 'correct-bar' : ''}`}>
                                                            <div
                                                                className={`history-bar-fill ${opt.isCorrect ? 'correct-fill' : ''}`}
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                            <div className="history-content">
                                                                <div className="history-opt-marker">
                                                                    {opt.isCorrect ? '✅' : idx + 1}
                                                                </div>
                                                                <span className="history-opt-text">{opt.text}</span>
                                                                <span className="history-opt-percent">{percent}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Poll Creation View */
                <div className="creation-view">
                    <div className="header-section">
                        <div className="header-actions">
                            <button className="view-history-btn" onClick={handleViewHistory}>
                                👁 View Poll history
                            </button>
                        </div>
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
            )}

            <ChatWidget role="TEACHER" />
        </div>
    );
};

export default TeacherDashboard;
