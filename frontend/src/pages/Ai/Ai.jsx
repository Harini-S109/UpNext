import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar1 from '../../components/Sidebar/Sidebar1';
import Chat from '../../components/Chat/Chat';
import Navbar from '../../components/Navbar/Navbar';
import axios from '../../utils/axiosInstance';
import moment from 'moment';
import ToDolist from '../../components/Todo list/ToDolist';
import "../../App.css";
import Remainder from '../../components/Remainder/Remainder';

const Ai = () => {


    const [userInfo, setUserInfo] = useState("");
    const [taskStats, setTaskStats] = useState({
        total: 0,
        todo: 0,
        inProgress: 0,
        completed: 0
    });
    const navigate = useNavigate();
    const currentDate = new Date();

    const getUserInfo = async () => {
        try {
            console.log("Fetching user info...");
            console.log("Token:", localStorage.getItem("token"));
            
            const response = await axiosInstance.get("/get-user");      
            console.log("User response:", response.data);
            
            if(response.data && response.data.user) {
                setUserInfo(response.data.user);
            }
        } catch(error) {
            console.error("Error details:", error);
            console.error("Response status:", error.response?.status);
            console.error("Response data:", error.response?.data);
            
            if(error.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
        }
    };

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

    const AllTasks = async () => {
        try {
            const response = await axiosInstance.get("/get-all-tasks");
            console.log("Raw tasks response:", response); // Debug raw response
            console.log("Tasks data:", response.data); // Debug data
            
            // Check the actual structure of your response
            let tasks = [];
            if (response.data && response.data.tasks) {
                tasks = response.data.tasks; // If tasks are nested under 'tasks' key
            } else if (Array.isArray(response.data)) {
                tasks = response.data; // If response.data is directly the array
            } else {
                console.error("Unexpected response structure:", response.data);
                return;
            }

            console.log("Processed tasks array:", tasks); // Debug processed array

            // Now we're sure tasks is an array
            setTaskStats({
                total: tasks.length,
                todo: tasks.filter(task => task.status === 'TO DO').length,
                inProgress: tasks.filter(task => task.status === 'IN PROGRESS').length,
                completed: tasks.filter(task => task.status === 'COMPLETED').length
            });
            
        }  catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        AllTasks();
        getUserInfo();
    }, []); 

    const getGreeting = () => {
        const hour = currentDate.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className='d-flex flex-row' >
            <Sidebar1 bg="Ai"/>

            <div className='d-flex flex-column w-100'>

            
        <div className="ai-fullscreen">
            {/* AI Header */}
            <div className="ai-header">
            <div className="header-title-container">
                <div className="assistant-avatar">A</div>
                <h4 className="header-title">UpNext Assistant</h4>
            </div>
            <div className="header-actions">
                <button className="new-chat-button" onClick={startNewChat}>
                New chat
                </button>
            </div>
            </div>

            {/* AI Messages */}
            <div className="ai-messages">
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

            {/* AI Input */}
            <form onSubmit={sendMessage} className="ai-input-form">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here"
                className="ai-input"
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
        </div>
    );
};

export default Ai;