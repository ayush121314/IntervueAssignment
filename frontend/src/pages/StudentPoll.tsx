import React, { useState } from 'react';
import ChatWidget from '../components/ChatWidget';
import './StudentPoll.css';

const StudentPoll: React.FC = () => {
    // Mock states: 'WAITING' | 'ACTIVE' | 'VOTED' | 'KICKED'
    const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'VOTED' | 'KICKED'>('ACTIVE');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const handleSubmit = () => {
        if (selectedOption) {
            setStatus('VOTED');
        }
    };

    if (status === 'KICKED') {
        return (
            <div className="student-poll-container centered-view">
                <div className="brand-badge"><span>✨</span> Intervue Poll</div>
                <h1 className="kicked-title">You've been Kicked out !</h1>
                <p className="subtitle">Looks like the teacher had removed you from the poll system .Please Try again sometime.</p>
            </div>
        );
    }

    if (status === 'WAITING') {
        return (
            <div className="student-poll-container centered-view">
                <div className="brand-badge"><span>✨</span> Intervue Poll</div>
                <div className="loader-spinner">C</div> {/* CSS Spinner */}
                <h2 className="waiting-text">Wait for the teacher to ask questions..</h2>

                {/* Dev Toggle */}
                <button onClick={() => setStatus('ACTIVE')} style={{ marginTop: 20, opacity: 0.5 }}>Dev: Activate</button>
            </div>
        );
    }

    if (status === 'VOTED') {
        // Similar to Waiting but maybe says "Wait for new question"
        // Screenshot 5.59.06 (File 31) shows "Wait for the teacher to ask a new question.." BELOW the results?
        // Actually Screenshot 31 shows: Header Question 1 00:15. Question Box with Results (Bars). And text below "Wait for the teacher...".
        // So VOTED state shows results + waiting message.
        return (
            <div className="student-poll-container">
                <div className="poll-header-row">
                    <span className="q-number">Question 1</span>
                    <span className="timer expired">⏱ 00:00</span>
                </div>

                <div className="question-card">
                    <div className="question-text-box">
                        Which planet is known as the Red Planet?
                    </div>
                    <div className="results-list">
                        {/* Reuse similar result bars logic or just static for verify */}
                        {[
                            { id: 1, text: 'Mars', percent: 75 },
                            { id: 2, text: 'Venus', percent: 5 },
                            { id: 3, text: 'Jupiter', percent: 5 },
                            { id: 4, text: 'Saturn', percent: 15 }
                        ].map((opt, idx) => (
                            <div key={opt.id} className="result-row">
                                <div className="result-bar-bg">
                                    <div className="result-bar-fill" style={{ width: `${opt.percent}%` }}></div>
                                    <div className="result-content">
                                        <div className="opt-marker">{idx + 1}</div>
                                        <span className="opt-text">{opt.text}</span>
                                        <span className="opt-percent">{opt.percent}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="waiting-footer-text">Wait for the teacher to ask a new question..</p>
                {/* Dev Toggle */}
                <button onClick={() => setStatus('WAITING')} style={{ marginTop: 20, opacity: 0.5 }}>Dev: Reset</button>
            </div>
        );
    }

    return (
        <div className="student-poll-container">
            <div className="poll-header-row">
                <span className="q-number">Question 1</span>
                <span className="timer">⏱ 00:15</span>
            </div>

            <div className="question-card">
                <div className="question-text-box">
                    Which planet is known as the Red Planet?
                </div>

                <div className="options-list-active">
                    {[
                        { id: 1, text: 'Mars' },
                        { id: 2, text: 'Venus' },
                        { id: 3, text: 'Jupiter' },
                        { id: 4, text: 'Saturn' }
                    ].map((opt, idx) => (
                        <label
                            key={opt.id}
                            className={`option-label ${selectedOption === opt.id ? 'selected' : ''}`}
                        >
                            <div className="opt-col-left">
                                <div className="opt-marker-active">{idx + 1}</div>
                                <span className="opt-text">{opt.text}</span>
                            </div>
                            {/* Radio is hidden or styled? 
                           Screenshot 5.59.06 (File 29) shows just a purple border when selected? 
                           Actually it shows Purple Border and maybe a checkmark? 
                           Or just highlited. 
                           I'll use purple border. 
                        */}
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
                    disabled={!selectedOption}
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>

            <ChatWidget role="STUDENT" />
        </div >
    );
};

export default StudentPoll;
