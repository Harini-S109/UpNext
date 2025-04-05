import React from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";
import { BsCalendar } from "react-icons/bs";
import moment from 'moment';

const TaskCard = ({ title, date, description, status, priority, tags, isPinned, onEdit, onDelete, onPinTask }) => {
  return (
    <div className="card border-0 shadow-sm p-3 bg-light rounded position-relative" style={{ width: '18rem' }}>
      
      {/* Header Section with Tags and Priority */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex gap-2">
          <span className="badge bg-secondary">{tags.length > 0 ? `${tags[0].toUpperCase()}` : ""}</span>
          <span className={`badge ${priority === 'High' ? 'text-danger' : 'text-warning'}`}>
            {priority}
          </span>
        </div>

        <div className='d-flex gap-2'>
            {/* Pin Icon with Conditional Styling */}
        <MdOutlinePushPin 
          className={`cursor-pointer ${isPinned ? 'text-dark' : 'text-muted'}`} 
          onClick={onPinTask}
        />
         <MdCreate 
          className="" 
          onClick={onEdit}
        />
        <MdDelete 
          className="" 
          onClick={onDelete}
        />
        </div>
      </div>

      {/* Title and Description Section */}
      <h5 className="fw-bold">{title}</h5>
      <p className="text-muted ">{description?.slice(0, 90)}...</p>

      {/* Footer Section */}
      <div className="d-flex justify-content-between align-items-center">
        
        {/* Status */}
        <div className="d-flex align-items-center gap-2">
          <div>{status}</div>
        </div>

        {/* Date and Comments */}
        <div className="d-flex gap-3 text-muted">
          <div className="d-flex align-items-center gap-1">
            <BsCalendar /> {moment(date).format('Do MMM YYYY')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
