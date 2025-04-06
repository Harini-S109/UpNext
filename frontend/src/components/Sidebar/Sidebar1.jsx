import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaTasks, FaTrophy, FaStickyNote, FaCalendarAlt, FaBars, FaTimes } from 'react-icons/fa';
import "../../App.css";

const Sidebar = ({ bg }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <>
            {/* Hamburger toggle button - visible only on small screens */}
            <button 
                className="d-md-none position-fixed top-0 start-0 btn m-2 z-3" 
                onClick={toggleSidebar}
                style={{ backgroundColor: "#7161EF", color: "#fff" }}
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-md-none" 
                    style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1 }}
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div 
                className={`d-flex flex-column vh-100 px-4 py-3 bg-light border-end justify-content-between position-fixed ${isOpen ? 'show-sidebar' : 'hide-sidebar'}`}
                style={{
                    width: "210px",
                    zIndex: 2,
                    transition: "transform 0.3s ease-in-out"
                }}
            >
                <div>
                    {/* App Title */}
                    <h4 className="fw-bold mb-4" style={{ color: "#7161EF" }}>UpNext</h4>
                    
                    {/* Menu Section */}
                    <p className="fw-semibold text-muted">Menu</p>
                    <ul className="list-unstyled">
                        <li className="mb-2">
                            <Link 
                                to="/home" 
                                className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                                style={bg === "home" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}
                                onClick={() => setIsOpen(false)}
                            >
                                <FaHome />
                                Home
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link 
                                to="/tasks" 
                                className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                                style={bg === "tasks" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}
                                onClick={() => setIsOpen(false)}
                            >
                                <FaTasks />
                                Tasks
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link 
                                to="/notes" 
                                className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                                style={bg === "notes" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}
                                onClick={() => setIsOpen(false)}
                            >
                                <FaStickyNote />
                                Notes
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link 
                                to="/Ai" 
                                className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                                style={bg === "Ai" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}
                                onClick={() => setIsOpen(false)}
                            >
                                <FaTrophy />
                                Ask AI
                            </Link>
                        </li>
                        <li className="mb-4">
                            <Link 
                                to="/calendar" 
                                className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                                style={bg === "goals" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}
                                onClick={() => setIsOpen(false)}
                            >
                                <FaCalendarAlt />
                                Calendar
                            </Link>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <button className="btn-custom" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content padding - to push content away from sidebar on larger screens */}
            <div className="d-none d-md-block" style={{ width: "250px" }}></div>
        </>
    );
};

export default Sidebar;