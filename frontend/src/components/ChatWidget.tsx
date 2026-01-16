import React, { useState } from 'react';
import './ChatWidget.css';

interface ChatWidgetProps {
    role: 'STUDENT' | 'TEACHER';
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Chat' | 'Participants'>('Chat');

    // Mock Messages
    const [messages, setMessages] = useState([
        { id: 1, sender: 'User 1', text: 'Hey There, how can I help?', isMe: false },
        { id: 2, sender: 'User 2', text: 'Nothing bro..just chill!!', isMe: true }
    ]);
    const [newMessage, setNewMessage] = useState('');

    // Mock Participants
    const [participants, setParticipants] = useState([
        { id: 1, name: 'Rahul Arora' },
        { id: 2, name: 'Pushpender Rautela' },
        { id: 3, name: 'Rijul Zalpuri' },
        { id: 4, name: 'Nadeem N' },
        { id: 5, name: 'Ashwin Sharma' }
    ]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, { id: Date.now(), sender: 'Me', text: newMessage, isMe: true }]);
        setNewMessage('');
    };

    const handleKick = (id: number) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    return (
        <div className="chat-widget-wrapper">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <button
                            className={`tab-btn ${activeTab === 'Chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Chat')}
                        >
                            Chat
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'Participants' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Participants')}
                        >
                            Participants
                        </button>
                    </div>

                    <div className="chat-body">
                        {activeTab === 'Chat' && (
                            <div className="chat-content">
                                <div className="messages-list">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`message-bubble ${msg.isMe ? 'my-message' : 'other-message'}`}>
                                            <div className="sender-name">{msg.sender}</div>
                                            <div className="message-text">{msg.text}</div>
                                        </div>
                                    ))}
                                </div>
                                <form className="chat-input-area" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit">→</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'Participants' && (
                            <div className="participants-content">
                                <div className="participants-header-row">
                                    <span>Name</span>
                                    {role === 'TEACHER' && <span>Action</span>}
                                </div>
                                <div className="participants-list">
                                    {participants.map(p => (
                                        <div key={p.id} className="participant-row">
                                            <span className="p-name">{p.name}</span>
                                            {role === 'TEACHER' && (
                                                <button
                                                    className="kick-btn"
                                                    onClick={() => handleKick(p.id)}
                                                >
                                                    Kick out
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button className="chat-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
};

export default ChatWidget;
