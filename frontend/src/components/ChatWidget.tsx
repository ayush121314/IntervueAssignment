import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollContext } from '../context/PollContext';
import { usePollState } from '../hooks/usePollState';
import './ChatWidget.css';

interface ChatWidgetProps {
    role: 'STUDENT' | 'TEACHER';
}

interface Message {
    id: string;
    sender: string;
    text: string;
    role: 'STUDENT' | 'TEACHER';
    timestamp: Date;
}

interface Participant {
    id: string;
    name: string;
    joinedAt?: Date;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Chat' | 'Participants'>('Chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const { socket } = useSocket();
    const { studentInfo } = usePollContext();
    const { pollState } = usePollState(socket);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chat history on mount
    useEffect(() => {
        if (socket && isOpen) {
            socket.emit('chat:getHistory');
        }
    }, [socket, isOpen]);

    // Listen to socket events
    useEffect(() => {
        if (!socket) return;

        const handleChatHistory = (history: Message[]) => {
            setMessages(history);
        };

        const handleChatMessage = (message: Message) => {
            setMessages(prev => [...prev, message]);
        };

        const handleParticipantsUpdate = (updatedParticipants: Participant[]) => {
            setParticipants(updatedParticipants);
        };

        socket.on('chat:history', handleChatHistory);
        socket.on('chat:message', handleChatMessage);
        socket.on('participants:update', handleParticipantsUpdate);

        return () => {
            socket.off('chat:history', handleChatHistory);
            socket.off('chat:message', handleChatMessage);
            socket.off('participants:update', handleParticipantsUpdate);
        };
    }, [socket]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const sender = role === 'TEACHER' ? 'Teacher' : (studentInfo?.name || 'Student');

        socket.emit('chat:message', {
            sender,
            text: newMessage.trim(),
            role
        });

        setNewMessage('');
    };

    const handleKick = (studentId: string) => {
        if (!socket) return;

        if (pollState.status === 'ACTIVE') {
            alert('Cannot kick students while a poll is active');
            return;
        }

        if (confirm('Are you sure you want to kick this student?')) {
            socket.emit('student:kick', { studentId });
        }
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
                                    {messages.map((msg, idx) => (
                                        <div key={msg.id || `msg-${idx}`} className={`message-bubble ${msg.role === role ? 'my-message' : 'other-message'}`}>
                                            <div className="sender-name">{msg.sender}</div>
                                            <div className="message-text">{msg.text}</div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
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
                                    {participants.length === 0 && (
                                        <p className="no-participants">No active participants</p>
                                    )}
                                    {participants.map((p, idx) => (
                                        <div key={p.id || `participant-${idx}`} className="participant-row">
                                            <span className="p-name">{p.name}</span>
                                            {role === 'TEACHER' && (
                                                <button
                                                    className="kick-btn"
                                                    onClick={() => handleKick(p.id)}
                                                    title={pollState.status === 'ACTIVE' ? "Cannot kick students while a poll is active" : ""}
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
