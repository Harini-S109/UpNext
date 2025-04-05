import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaTasks, FaTrophy, FaStickyNote, FaCalendarAlt } from 'react-icons/fa';
import "../../App.css";

const Sidebar1 = ({bg}) => {

    const navigate = useNavigate();

    const onLogout = () => {
      localStorage.clear();
      navigate("/login");
    }

    return (
        <div className="d-flex flex-column vh-100 px-4 py-3 bg-light border-end justify-content-between px-3">
            <div>
                {/* App Title */}
            <h4 className="fw-bold mb-4" style={{ color:"#7161EF" }}>UpNext</h4>

                {/* Menu Section */}
                <p className="fw-semibold text-muted">Menu</p>
                <ul className="list-unstyled">
                    <li className="mb-2">
                        <Link to="/home" className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                            style={bg === "home" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}>
                            <FaHome />
                            Home
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link to="/tasks" className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                            style={bg === "tasks" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}>
                            <FaTasks />
                            Tasks
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link to="/notes" className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                                style={bg === "notes" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}>
                            <FaStickyNote />
                            Notes
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link to="/askAI" className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                            style={bg === "goals" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}>
                            <FaTrophy />
                                Ask AI
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/calendar" className="d-flex align-items-center pe-5 gap-2 text-decoration-none p-2 rounded"
                            style={bg === "goals" ? { backgroundColor: "#7161EF", color: "#fff" } : { backgroundColor: "#f8f9fa", color: "#646464" }}>
                            <FaCalendarAlt />
                            Calendar
                        </Link>
                    </li>
                </ul>
            </div>

            <div>
                    <button className="btn-custom" onClick={onLogout} >
                        Logout
                    </button>
            </div>
        </div>
    );
};

export default Sidebar1;
