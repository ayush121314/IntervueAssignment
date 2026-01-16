import React, { useState } from 'react';
import ChatWidget from '../components/ChatWidget';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
    // State to toggle between Creation and Live view (mocking backend state)
    const [hasActivePoll, setHasActivePoll] = useState(false);

    // Form State
    const [question, setQuestion] = useState('');
    const [duration, setDuration] = useState('60');
    const [options, setOptions] = useState([
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false }
    ]);

    const handleOptionChange = (id: number, field: 'text' | 'isCorrect', value: string | boolean) => {
        setOptions(options.map(opt => {
            if (opt.id === id) {
                return { ...opt, [field]: value };
            }
            if (field === 'isCorrect' && value === true) {
                // Uncheck others if single choice (assuming single correct for now, though design allows multiple? Design uses radio for Yes/No per row, but logically usually one correct. 
                // Wait, design says "Is it Correct? ( ) Yes ( ) No" per row. This implies multiple could be correct or it's just a boolean per option. 
                // Technical doc doesn't specify. I'll treat them independent.)
                return opt;
            }
            return opt;
        }));
    };

    const addOption = () => {
        setOptions([...options, { id: Date.now(), text: '', isCorrect: false }]);
    };

    const handleAskQuestion = () => {
        if (!question.trim()) return;
        setHasActivePoll(true);
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
                                </select>
                            </div>
                            <textarea
                                className="question-input"
                                placeholder="Type your question here..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                maxLength={100}
                            />
                            <div className="char-count">{question.length}/100</div>
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
                            <button className="ask-question-btn" onClick={handleAskQuestion}>
                                Ask Question
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Live Monitor View */
                <div className="live-view">
                    <div className="live-header-actions">
                        <button className="view-history-btn">👁 View Poll history</button>
                    </div>

                    <div className="question-card">
                        <div className="question-header">
                            <span className="q-label">Question</span>
                            {/* Timer could go here */}
                        </div>

                        <div className="question-text-box">
                            {question || "Which planet is known as the Red Planet?"}
                        </div>

                        <div className="results-list">
                            {/* Mocking results for display using current options or defaults */}
                            {(options.length > 0 ? options : [
                                { id: 1, text: 'Mars', isCorrect: true },
                                { id: 2, text: 'Venus', isCorrect: false },
                                { id: 3, text: 'Jupiter', isCorrect: false },
                                { id: 4, text: 'Saturn', isCorrect: false }
                            ]).map((opt, idx) => (
                                <div key={opt.id} className="result-row">
                                    <div className="result-bar-bg">
                                        <div
                                            className="result-bar-fill"
                                            style={{ width: idx === 0 ? '75%' : idx === 3 ? '15%' : '5%' }}
                                        ></div>
                                        <div className="result-content">
                                            <div className="opt-marker">{idx + 1}</div>
                                            <span className="opt-text">{opt.text}</span>
                                            <span className="opt-percent">
                                                {idx === 0 ? '75%' : idx === 3 ? '15%' : '5%'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="live-footer">
                        <button className="ask-new-btn" onClick={() => setHasActivePoll(false)}>
                            + Ask a new question
                        </button>
                    </div>
                </div>
            )}

            <ChatWidget role="TEACHER" />
        </div>
    );
};

export default TeacherDashboard;
