import React, { useState, useEffect } from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete, MdCheckCircleOutline, MdAdd } from "react-icons/md";
import { BsAlarmFill } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import './Remainder.css';

const Remainder = ({ userId }) => {
    const [reminders, setReminders] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newReminder, setNewReminder] = useState({ title: '', time: '17:00' });
    const [editingReminder, setEditingReminder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCardId, setHoveredCardId] = useState(null);
    const [hoveredIconId, setHoveredIconId] = useState(null);
    const [showToast, setShowToast] = useState({
        isShown: false,
        message: "",
        type: ""
    });



    // Fetch all reminders
    const fetchReminders = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('/reminders', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure token is included
                }
            });
    
            setReminders(response.data); // Update state with fetched reminders
        } catch (error) {
            console.error('Error fetching reminders:', error);
            setError('Failed to load reminders. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    

   

    // Show toast message
    const showToastMsg = (message, type) => {
        setShowToast({
            isShown: true,
            message,
            type
        });
        
        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            setShowToast({
                isShown: false,
                message: "",
                type: ""
            });
        }, 3000);
    };

    // Add new reminder
    const handleAddReminder = async (e) => {
        e.preventDefault();
        if (!newReminder.title.trim()) return;
    
        try {
            const response = await axiosInstance.post("/reminders", {
                title: newReminder.title,
                time: newReminder.time,
            });
    
            fetchReminders()

            setReminders([...reminders, response.data]); // Use response.data instead of undefined variable
            setNewReminder({ title: '', time: '17:00' });
            setShowAddModal(false);
            showToastMsg('Reminder added successfully!', 'success');
        } catch (error) {
            console.error('Error adding reminder:', error);
            setError('Failed to add reminder. Please try again.');
            showToastMsg('Failed to add reminder', 'error');
        }
    };
    

    // Handle edit button click
    const handleEditClick = (reminder) => {
        setEditingReminder({...reminder});
        setShowEditModal(true);
    };

    // Update reminder
    const handleUpdateReminder = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(
                `/reminders/${editingReminder._id}`, // Correct API endpoint
                {
                    title: editingReminder.title, // Send only necessary fields
                    time: editingReminder.time
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure authentication
                    }
                }
            );
    
            setReminders(reminders.map(r => (r._id === response.data.remainder._id ? response.data.remainder : r)));
            setShowEditModal(false);
            showToastMsg('Reminder updated successfully!', 'edit');
        } catch (error) {
            console.error('Error updating reminder:', error);
            setError(error.response?.data?.message || 'Failed to update reminder. Please try again.');
            showToastMsg('Failed to update reminder', 'error');
        }
    };
    

    // Delete reminder
    const handleDeleteReminder = async (id) => {
        try {
            const response = await axiosInstance.delete(`/reminders/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure token is included
                }
            });

            fetchReminders()

    
            if (response.data && !response.data.error) {
                showToastMsg("Reminder Deleted Successfully!", "delete");
    
                // Remove the deleted reminder from state
                setReminders((prevReminders) => prevReminders.filter(r => r._id !== id));
    
                
            } else {
                setError(response.data.message || "Failed to delete reminder");
            }
    
        } catch (error) {
            console.error("Error deleting reminder:", error);
            setError(error.response?.data?.message || "An unexpected error occurred while deleting the reminder");
            showToastMsg("Failed to delete reminder", "error");
        }
    };
    
    //toggle completion
    const toggleComplete = (id) => {
        setReminders(reminders.map(reminder => 
          reminder._id === id ? { ...reminder, completed: !reminder.completed } : reminder
        ));
        showToastNotification('Status updated!', 'success');
      };

    // Format time for display
    const formatTime = (time) => {
        return time?.includes(':') 
            ? moment(time, 'HH:mm').format('h:mm A') 
            : time;
    };

    useEffect(() => {
        fetchReminders();
    }, []);  // Re-fetch reminders when refreshTrigger updates
    

    return (
        <div className="reminders-container">
        {/* Header with title and add button */}
        <div className="reminders-header">
          <h3>My Reminders</h3>
          <button 
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            <MdAdd size={20} />
          </button>
        </div>
  
        {/* Error message display */}
        {error && <div className="error-message">{error}</div>}
  
        {/* Loading state */}
        {isLoading ? (
          <div className="loading-message">Loading reminders...</div>
        ) : (
          /* Reminders list */
          <div className="reminders-list">
            {reminders.length === 0 ? (
              <div className="no-reminders">
                <p>No reminders yet. Click the + button to add one.</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div 
                  key={reminder._id}
                  className="reminder-item"
                >
                  <div 
                    className={`reminder-checkbox ${reminder.completed ? 'completed' : ''}`}
                    onClick={() => toggleComplete(reminder._id)}
                  ></div>
                  <div className="reminder-content me-4">
                    <h4 className="reminder-title">{reminder.title || "No Title"}</h4>
                    <div className="reminder-time">
                      <BsAlarmFill size={14} />
                      <span>{formatTime(reminder.time)}</span>
                    </div>
                  </div>
                  <div className="reminder-actions">
                    <button 
                      className="action-button edit-button"
                      onClick={() => handleEditClick(reminder)}
                    >
                      <MdCreate size={18} />
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDeleteReminder(reminder._id)}
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
  
        {/* Add Reminder Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Add New Reminder</h4>
              <form onSubmit={handleAddReminder}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input 
                    type="text" 
                    id="title"
                    placeholder="What do you need to remember?" 
                    value={newReminder.title} 
                    onChange={e => setNewReminder({ ...newReminder, title: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input 
                    type="time" 
                    id="time"
                    value={newReminder.time} 
                    onChange={e => setNewReminder({ ...newReminder, time: e.target.value })} 
                    required 
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Add Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Edit Reminder Modal */}
        {showEditModal && editingReminder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Edit Reminder</h4>
              <form onSubmit={handleUpdateReminder}>
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input 
                    type="text" 
                    id="edit-title"
                    value={editingReminder.title} 
                    onChange={e => setEditingReminder({ ...editingReminder, title: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-time">Time</label>
                  <input 
                    type="time" 
                    id="edit-time"
                    value={editingReminder.time} 
                    onChange={e => setEditingReminder({ ...editingReminder, time: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={editingReminder.completed} 
                      onChange={e => setEditingReminder({ ...editingReminder, completed: e.target.checked })} 
                    />
                    Mark as completed
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Update Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Toast Notification */}
        {showToast.isShown && (
          <div className={`toast-notification ${showToast.type}`}>
            <p>{showToast.message}</p>
          </div>
        )}
      </div>
    );
  };

export default Remainder;