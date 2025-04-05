import React, { useState, useEffect, useRef } from 'react';
import "../../App.css";
import axiosInstance from '../../utils/axiosInstance';

const AskAi = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Fetch chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await axiosInstance.get('/ai-history');
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching AI history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleAi = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await axiosInstance.post('/send-query', {
        message: newMessage
      });

      // Add assistant response
      if (response.data && response.data.reply) {
        const assistantMessage = {
          id: Date.now() + 1,
          text: response.data.reply,
          sender: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startNewConversation = () => {
    setMessages([]);
    // Optionally save the current conversation
    // saveConversationToHistory();
  };

  return (
    <div className={`askAi-container ${isOpen ? 'open' : ''}`}>
      {!isOpen ? (
        <button className="askAi-button" onClick={toggleAi}>
          <span className="askAi-icon">💡</span>
          <span>Ask AI</span>
        </button>
      ) : (
        <div className="askAi-window">
          <div className="askAi-header">
            <div className="header-title-container">
              <span className="askAi-icon">💡</span>
              <h3>Ask AI</h3>
            </div>
            <div className="header-actions">
              <button className="action-button" onClick={startNewConversation}>
                <span className="new-conversation-icon">🔄</span>
                New conversation
              </button>
              <button className="close-button" onClick={toggleAi}>
                ✕
              </button>
            </div>
          </div>
          
          <div className="askAi-messages">
            {messages.length === 0 && (
              <div className="initial-message">
                How can I help you today? Ask me anything about your tasks or productivity.
              </div>
            )}
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.sender === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                {msg.text}
                <div className="message-timestamp">{formatTimestamp(msg.timestamp)}</div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant-message loading">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form className="askAi-input-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="askAi-input"
              placeholder="Ask me anything..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button 
              type="button" 
              className="send-button"
              onClick={handleSend}
              disabled={isLoading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AskAi;