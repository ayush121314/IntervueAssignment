import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import type { PollHistoryItem } from '../services/api';
import './TeacherDashboard.css';
import './PollHistory.css';

const PollHistory: React.FC = () => {
    const [history, setHistory] = useState<PollHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await apiService.getPollHistory();
                setHistory(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching poll history:', err);
                setError('Failed to load poll history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="poll-history-container">
                <h1 className="history-title">View Poll History</h1>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="poll-history-container">
                <h1 className="history-title">View Poll History</h1>
                <p className="error-text">{error}</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="poll-history-container">
                <h1 className="history-title">View Poll History</h1>
                <p>No polls have been completed yet.</p>
            </div>
        );
    }

    return (
        <div className="poll-history-container">
            <h1 className="history-title">View Poll History</h1>

            <div className="history-list">
                {history.map((poll, index) => {
                    const total = poll.options.reduce((sum, o) => sum + o.voteCount, 0) || 1;

                    return (
                        <div key={poll.id} className="history-item">
                            <h2 className="history-q-label">Question {index + 1}</h2>

                            <div className="question-card">
                                <div className="question-text-box">
                                    {poll.question}
                                </div>
                                <div className="results-list">
                                    {poll.options.map((opt, idx) => {
                                        const percent = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;

                                        return (
                                            <div key={opt.id} className="result-row">
                                                <div className="result-bar-bg">
                                                    <div className="result-bar-fill" style={{ width: `${percent}%` }}></div>
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PollHistory;
