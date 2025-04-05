import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { MdClose } from 'react-icons/md';
import '../../App.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId') || null);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);
  
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Configure axios with auth headers
    const api = axios.create({
      baseURL: 'https://upnext-a70q.onrender.com',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  
    // Scroll to bottom of messages
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    // Load chat history if session exists
    useEffect(() => {
      const loadChatHistory = async () => {
        if (sessionId) {
          try {
            const response = await api.get(`/chat-sessions/${sessionId}`);
            if (response.data && response.data.messages) {
              setMessages(response.data.messages);
            }
          } catch (error) {
            console.error('Failed to load chat history:', error);
            localStorage.removeItem('chatSessionId');
            setSessionId(null);
          }
        }
      };
  
      if (token) {
        loadChatHistory();
      }
    }, [sessionId, token]);
  
    const sendMessage = async (e) => {
      e.preventDefault();
      if (!input.trim() || !token) return;
  
      // Add user message to UI
      const userMessage = { content: input, role: 'user' };
      setMessages([...messages, userMessage]);
      setInput('');
      setLoading(true);
  
      try {
        // Send message to backend
        const response = await api.post('/send-message', {
          message: input,
          sessionId: sessionId
        });
  
        // Check if we have a valid response
        if (response.data && !response.data.error) {
          // Add AI response to UI
          setMessages(prevMessages => [
            ...prevMessages,
            { content: response.data.response, role: 'assistant' }
          ]);
  
          // Save session ID if it's a new session
          if (response.data.session && response.data.session._id && !sessionId) {
            setSessionId(response.data.session._id);
            localStorage.setItem('chatSessionId', response.data.session._id);
          }
        } else {
          // Handle API error response
          throw new Error(response.data.message || 'Failed to get response');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`,
            role: 'assistant' 
          }
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
  
    const toggleChat = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <>
        {/* Chat Button */}
        <div className="chat-button" onClick={toggleChat}>
          <div className="chat-icon">
            <span>AI</span>
          </div>
        </div>
  
        {/* Modal Overlay */}
        {isOpen && (
          <div className="chat-overlay">
            {/* Chat Modal */}
            <div className="chat-modal">
              {/* Modal Header */}
              <div className="chat-modal-header">
                <div className="header-title-container">
                  <div className="assistant-avatar">A</div>
                  <h4 className="header-title">UpNext Assistant</h4>
                </div>
                <div className="header-actions">
                  <button className="new-chat-button" onClick={startNewChat}>
                    New chat
                  </button>
                  <button className="close-button" onClick={toggleChat}>
                    <MdClose />
                  </button>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="initial-message">
                    <div>Hello! How can I assist you today?</div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
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
              
              {/* Chat Input */}
              <form onSubmit={sendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here"
                  className="chat-input"
                />
                <button 
                  type="submit" 
                  className="send-button"
                  disabled={loading}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
};

export default Chat;