import React from 'react'
import { Link, useNavigate } from "react-router-dom"; 

const Sidebar = () => {

  const navigate = useNavigate();

  const onLogout = () => {
    navigate("/login");
  }

  return (
    
    <div className='bg-white p-3 border border-black rounded vh-100 d-flex flex-column' style={{ width: '14rem' }}>
      {/* Title Section */}
      <h4>Productivity App</h4>

      {/* All Tasks Link (Pinned at the Top) */}
      <Link to="/tasks" className=''>All Tasks</Link>

      {/* Spacer to Push Logout to the Bottom */}
      <div className='flex-grow-1'></div>
      
      {/* Logout Button (Pinned at the Bottom) */}
      <div>
        <button className='bg-primary text-white w-100 border-0 p-2 rounded' onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
};

export default Sidebar;
