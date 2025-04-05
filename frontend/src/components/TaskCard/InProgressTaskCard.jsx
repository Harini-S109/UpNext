import React, { useState, useEffect } from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";
import { BsCalendar } from "react-icons/bs";
import { AiFillForward } from "react-icons/ai";
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance'; // Adjust the path if needed

const InProgressTaskCard = ({ 
    taskId, // Use taskId instead of key
    title, 
    date, 
    description, 
    status, 
    priority, 
    tags, 
    isPinned, 
    onEdit, 
    onDelete, 
    onPinTask, 
    onStatusChange // Callback for status change
}) => {
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hoveredIcon, setHoveredIcon] = useState(null);
    

    // Function to handle status update
    const changeToInProgress = async () => {
        setIsUpdating(true); 
        setError(null); 
    
        try {
            // Make an API call to update the task status
            const response = await axiosInstance.post(`/edit-task/${taskId}`, {
                status: "COMPLETED",
            });
    
            if (response.data && response.data.task) {
                onStatusChange(taskId, "COMPLETED"); // Update the task status in parent component state
            }
        } catch (error) {
            // Handle errors
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsUpdating(false); // Reset loading state
        }
    };

    //get all tasks
  const getAllTasks = async() => {
    try{
      const response = await axiosInstance.get("/get-all-tasks");

      if(response.data && response.data.tasks){
        setAllTasks(response.data.tasks);
      }

    }catch(error){
      console.log("An unexpected error occurred. Please try again");
    }
  }

  useEffect(() => {
      getAllTasks();
    }, []);

    return (
        <div className="card border p-3 bg-light rounded position-relative" style={{ width: '18rem' }}>
            {/* Header Section */}
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

                <div className="d-flex gap-2">
                    <MdOutlinePushPin
                        className={`cursor-pointer ${isPinned ? 'text-dark' : ''}`}
                        style={{ color: hoveredIcon === "pin" ? '#000' : '#ababab' }}
                        onMouseEnter={() => setHoveredIcon("pin")}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => onPinTask(taskId, isPinned)}
                    />
                    <MdCreate 
                        className="cursor-pointer"
                        style={{ color: hoveredIcon === "edit" ? '#000' : '#ababab' }}
                        onMouseEnter={() => setHoveredIcon("edit")}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={onEdit}
                    />
                    <MdDelete 
                        className="cursor-pointer"
                        style={{ color: hoveredIcon === "delete" ? '#cd2929' : '#ababab' }}
                        onMouseEnter={() => setHoveredIcon("delete")}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={onDelete}
                    />
                </div>
            </div>

            {/* Title and Description Section */}
            <h5 className="fw-bold">{title}</h5>
            <p className="fs-6 lh-sm" style={{color:"#999999"}}>{description?.slice(0, 90)}...</p>

            {/* Error Display */}
            {error && <p className="text-danger small mb-2">{error}</p>}

            {/* Footer Section */}
           <div className="d-flex justify-content-between align-items-center">
                           <div className="d-flex gap-3 fw-medium" style={{color:"#999999"}}>
                               <div className="d-flex align-items-center gap-1 fs-6">
                                   <BsCalendar size={16} /> 
                                   {moment(date).format('Do MMM')}
                               </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button 
                        className="border-0 bg-light d-flex align-items-center" 
                        onClick={changeToInProgress}
                        disabled={isUpdating} // Disable button while updating
                    >
                        <AiFillForward size={26} color="#7161EF" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InProgressTaskCard;
