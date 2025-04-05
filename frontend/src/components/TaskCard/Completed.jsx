import React from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";
import { BsCalendar } from "react-icons/bs";
import moment from 'moment';
import { useState } from 'react';

const Completed = ({ title, date, description, status, priority, tags, isPinned, onEdit, onDelete, onPinTask }) => {

    const [hoveredIcon, setHoveredIcon] = useState(null);
  

  return (
    <div className="card border p-3 bg-light rounded position-relative" style={{ width: '18rem' }}>
      
      {/* Header Section with Tags and Priority */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex gap-2">
        <span className="badge align-items-center p-2 text-dark" style={{ background: '#C2C0FF' }}>
                        {tags.length > 0 ? `${tags[0].toUpperCase()}` : ""}
                    </span>
                    <span className="badge fs-6" 
                            style={{ color: priority === 'High' ? '#FF7575' : priority === 'Low' ? '#64FF0A' : '#FEEA68' }}>
                        {priority}
                    </span>
        </div>

        <div className='d-flex gap-2'>
        <MdOutlinePushPin
          className={`cursor-pointer ${isPinned ? 'text-dark' : ''}`}
          style={{ color: hoveredIcon === "pin" ? '#000' : '#ababab' }}
          onMouseEnter={() => setHoveredIcon("pin")}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={() => onPinTask(taskId, isPinned)}
        />

        <MdCreate 
            className="cursor-pointer" 
            style={{ color: hoveredIcon === "edit" ? "#000" : "#ababab" }}
            onMouseEnter={() => setHoveredIcon("edit")}
            onMouseLeave={() => setHoveredIcon(null)}
            onClick={onEdit}
        />

        <MdDelete 
            className="cursor-pointer" 
            style={{ color: hoveredIcon === "delete" ? "#cd2929" : "#ababab" }}
            onMouseEnter={() => setHoveredIcon("delete")}
            onMouseLeave={() => setHoveredIcon(null)}
            onClick={onDelete}
        />

        </div>
      </div>

      {/* Title and Description Section */}
      <h5 className="fw-bold">{title}</h5>
      <p className="fs-6 lh-sm" style={{color:"#999999"}}>{description?.slice(0, 90)}...</p>

      {/* Footer Section */}
      <div className="d-flex justify-content-between align-items-center">

        {/* Date and Comments */}
        <div className="d-flex gap-3 fw-medium" style={{color:"#999999"}}>
        <div className="d-flex align-items-center gap-1 fs-6">
            <BsCalendar size={16} /> {moment(date).format('Do MMM ')}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Completed;
