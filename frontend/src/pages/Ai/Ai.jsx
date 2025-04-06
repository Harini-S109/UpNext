import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar1 from '../../components/Sidebar/Sidebar1';
import axios from '../../utils/axiosInstance';
import "../../App.css";

const Ai = () => {
    const [userInfo, setUserInfo] = useState("");
    const [taskStats, setTaskStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0 });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId') || null);
    const [isOpen, setIsOpen] = useState(false);
    const [chatSessions, setChatSessions] = useState([]);
    const [showChatHistory, setShowChatHistory] = useState(false);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentDate = new Date();

    const api = axios.create({
        baseURL: 'https://upnext-a70q.onrender.com',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (token) {
            loadChatHistory();
            fetchChatSessions();
        }
    }, [sessionId, token]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getUserInfo = async () => {
        try {
            const response = await axios.get("/get-user");
            if (response.data && response.data.user) setUserInfo(response.data.user);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
        }
    };

    const fetchChatSessions = async () => {
        try {
            const response = await api.get('/chat-sessions');
            if (response.data) {
                setChatSessions(response.data);
            }
        } catch (error) {
            console.error("Error fetching chat sessions:", error);
        }
    };

    const loadChatHistory = async () => {
        if (sessionId) {
            try {
                const response = await api.get(`/chat-sessions/${sessionId}`);
                if (response.data && response.data.messages) {
                    setMessages(response.data.messages);
                }
            } catch (error) {
                localStorage.removeItem('chatSessionId');
                setSessionId(null);
            }
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !token) return;

        const userMessage = { content: input, role: 'user' };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/send-message', {
                message: input,
                sessionId: sessionId
            });

            if (response.data && !response.data.error) {
                setMessages(prev => [...prev, { content: response.data.response, role: 'assistant' }]);

                if (response.data.session && response.data.session._id && !sessionId) {
                    setSessionId(response.data.session._id);
                    localStorage.setItem('chatSessionId', response.data.session._id);
                }
            } else {
                throw new Error(response.data.message || 'Failed to get response');
            }
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`, role: 'assistant' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setSessionId(null);
        localStorage.removeItem('chatSessionId');
    };

    const getGreeting = () => {
        const hour = currentDate.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className='d-flex flex-row'>
            <Sidebar1 bg="Ai" />
            <div className='d-flex flex-column w-100'>

                {showChatHistory && (
                    <div className="chat-history">
                        <h4>Past Chats</h4>
                        {chatSessions.length === 0 ? (
                            <p>No previous sessions</p>
                        ) : (
                            <ul>
                                {chatSessions.map((session) => (
                                    <li key={session._id}>
                                        <button onClick={() => {
                                            setSessionId(session._id);
                                            setMessages(session.messages);
                                            localStorage.setItem('chatSessionId', session._id);
                                            setShowChatHistory(false);
                                        }}>
                                            {new Date(session.createdAt).toLocaleString()}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div className="ai-fullscreen">
                    {/* Header */}
                    <div className="ai-header">
                        <div className="header-title-container">
                            <div className="assistant-avatar">A</div>
                            <h4 className="header-title">UpNext Assistant</h4>
                        </div>
                        <div className="header-actions">
                            <button className="history-button" onClick={() => setShowChatHistory(!showChatHistory)}>
                                Chat History
                            </button>
                            <button className="new-chat-button" onClick={startNewChat}>
                                New chat
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="ai-messages">
                        {messages.length === 0 ? (
                            <div className="initial-message">Hello! How can I assist you today?</div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                                    {msg.content}
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="assistant-message loading">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="ai-input-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here"
                            className="ai-input"
                        />
                        <button type="submit" className="send-button" disabled={loading}>Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Ai;
