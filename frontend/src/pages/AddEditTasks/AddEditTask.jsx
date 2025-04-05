import React, { useState } from 'react'
import TagInput from '../../components/Input/TagInput'
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';
import '../../App.css';

const AddEditTask = ({taskData, type, onClose, name, getAllTasks, ShowToastMsg}) => {
  
  const [title, setTitle] = useState(taskData?.title || ""); 
  const [description, setDescription] = useState(taskData?.description || "");
  const [tags, setTags] = useState(taskData?.tag ? [taskData.tag] : []);
  const [priority, setPriority] = useState(taskData?.priority || "Low");
  const [status, setStatus] = useState(taskData?.status || "TO DO");

  const [error, setError] = useState(null);

  // Add new task
  const addNewTask = async () => {
    try {
      const response = await axiosInstance.post("/add-task", {
        title,
        description,
        tag: tags.length > 0 ? tags[0] : "",
        priority,
        status,
      });

      if (response.data && response.data.task) {
        ShowToastMsg("Task Added Successfully!")
        getAllTasks();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Task Added Successfully!", "add");
      }
    }
  };

  // edit task
  const editTask = async () => {
    const taskId = taskData._id
    try {
        const response = await axiosInstance.post("/edit-task/"+taskId, {
          title,
          description,
          tag: tags.length > 0 ? tags[0] : "",
          priority,
          status,
        });
  
        if (response.data && response.data.task) {
          ShowToastMsg("Task Updated Successfully!", "edit")
          getAllTasks();
          onClose();
        }
      } catch (error) {
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("An unexpected error occurred.");
        }
      }
  }

  const handleAddTask = () => {
    if(!title) {
        setError("Please enter the title");
        return;
    }

    if(!description){
        setError("Please enter description");
        return;
    }

    setError("");

    if(type === 'edit'){
        editTask()
    }
    else{
        addNewTask()
    }
  }

  return (
    <div className="login-content-wrapper" style={{maxWidth: "600px", margin: "20px auto"}}>
        <div className="login-form-container" style={{flex: "1", padding: "25px"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <h4 style={{color: "#4A1434", fontWeight: "bold", margin: 0}}>{name}</h4>
                <button onClick={onClose} style={{background: "transparent", border: "none", cursor: "pointer"}}>
                    <MdClose />
                </button>
            </div>
            
            <div>
                <div className="login-input-group">
                    <label>Title</label>
                    <input 
                        className="login-input"
                        type="text"
                        placeholder="Title name"
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                    />
                </div>
                
                <div className="login-input-group">
                    <label>Description</label>
                    <textarea 
                        className="login-input"
                        style={{minHeight: "150px", resize: "vertical"}}
                        placeholder="Add description"
                        rows={8}
                        value={description}
                        onChange={({ target }) => setDescription(target.value)}
                    />
                </div>
                
                <div className="login-input-group">
                    <label>Tags</label>
                    <div style={{marginTop: "8px"}}>
                        <TagInput tags={tags} setTags={setTags} />
                    </div>
                </div>
                
                <div className="login-input-group">
                    <label>Priority</label>
                    <select
                        className="login-input"
                        value={priority}
                        onChange={({ target }) => setPriority(target.value)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                
                <div className="login-input-group">
                    <label>Status</label>
                    <select
                        className="login-input"
                        value={status}
                        onChange={({ target }) => setStatus(target.value)}>
                        <option value="TO DO">To-do</option>
                        <option value="IN PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                {error && <p className="login-error-text">{error}</p>}

                <button 
                    className="login-button"
                    onClick={handleAddTask}
                >
                    {type === 'edit' ? 'UPDATE' : 'ADD'}
                </button>
            </div>
        </div>
    </div>
  )
}

export default AddEditTask