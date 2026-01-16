import React from 'react';
import './TeacherDashboard.css'; // Reuse styles
import './PollHistory.css'; // Specific adjustments

const PollHistory: React.FC = () => {
    // Mock data
    const history = [
        {
            id: 1,
            question: "Which planet is known as the Red Planet?",
            options: [
                { id: 1, text: 'Mars', percent: 75, isCorrect: true },
                { id: 2, text: 'Venus', percent: 5 },
                { id: 3, text: 'Jupiter', percent: 5 },
                { id: 4, text: 'Saturn', percent: 15 }
            ]
        },
        {
            id: 2,
            question: "What is the capital of France?",
            options: [
                { id: 1, text: 'London', percent: 10 },
                { id: 2, text: 'Berlin', percent: 5 },
                { id: 3, text: 'Paris', percent: 80, isCorrect: true },
                { id: 4, text: 'Madrid', percent: 5 }
            ]
        }
    ];

    return (
        <div className="poll-history-container">
            <h1 className="history-title">View Poll History</h1>

            <div className="history-list">
                {history.map((poll, index) => (
                    <div key={poll.id} className="history-item">
                        <h2 className="history-q-label">Question {index + 1}</h2>

                        <div className="question-card">
                            <div className="question-text-box">
                                {poll.question}
                            </div>
                            <div className="results-list">
                                {poll.options.map((opt, idx) => (
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PollHistory;
