import React, { useEffect, useState } from 'react';
import Sidebar1 from '../../components/Sidebar/Sidebar1';
import Navbar from '../../components/Navbar/Navbar';
import AddEditTask from '../AddEditTasks/AddEditTask';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import moment from "moment";
import TodoTaskCard from '../../components/TaskCard/TodoTaskCard';
import InProgressTaskCard from '../../components/TaskCard/InProgressTaskCard';
import Completed from '../../components/TaskCard/Completed';
import { Toast } from '../../components/ToastMessage/Toast';
import '../../App.css';
import Chat from '../../components/Chat/Chat';
// Required for accessibility
// Modal.setAppElement('#root');

const Tasks = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [isSearch, setIsSearch] = useState(false);

  const [showToast, setShowToast] = useState({
    isShown : false,
    message: "",
    type : ""
  })

  const [userInfo, setUserInfo] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const filteredTasks = (status) => allTasks.filter(task => task.status === status);

  
  const navigate = useNavigate();

  const handleEdit = (taskDetails) => {
    setOpenAddEditModal ({ isShown: true, data: taskDetails, type : "edit" });
  }

  const ShowToastMsg = (message, type) => {
    setShowToast({
      isShown: true,
      message,
      type
    })
  }

  const handleCloseToast = () => {
    setShowToast({
      isShown: false,
      message: "",
      type:""
    })
  }

  //get user info
  const getUserInfo = async () => {
    try {
      console.log("Fetching user info..."); // Debug log
      console.log("Token:", localStorage.getItem("token")); // Check if token exists
      
      const response = await axiosInstance.get("/get-user");      
      console.log("User response:", response.data); // Debug log
      
      if(response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch(error) {
      console.error("Error details:", error); // More detailed error logging
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      
      if(error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }

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

  //delete tasks
  const deleteTask = async (data) => {
    const taskId = data._id;
    try {
        const response = await axiosInstance.delete(`/delete-task/${taskId}`);
        
        if (response.data && !response.data.error) {
          ShowToastMsg("Task Deleted Successfully!", "delete")
            getAllTasks();
            onClose();
        } else {
            setError(response.data.message || "Failed to delete task");
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError("An unexpected error occurred while deleting the task");
        }
    }
}

const handleStatusChange = (taskId, newStatus) => {
  const updatedTasks = allTasks.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
  );
  setAllTasks(updatedTasks); // Update the state with the new task status
};

  //search for a task
  const onSearchTask = async (query) => {
    try{
      const response = await axiosInstance.get("/search-tasks", {
        params: {query},
      })
      if(response.data && response.data.tasks) {
        setIsSearch(true);
        setAllTasks(response.data.tasks);
      }
    }catch(error){
      console.log(error);
    }
  }

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllTasks();
  }

  const updateIsPinned = async (taskData) => {
    const taskId = taskData._id
    try {
        const response = await axiosInstance.put("/update-task-pinned/"+taskId, {
          "isPinned" : !taskId.isPinned,
        });
  
        if (response.data && response.data.task) {
          ShowToastMsg("Task Updated Successfully!", "edit")
          getAllTasks();
          onClose();
        }
      } catch (error) {
        console.log(error);
      }
};



  useEffect(() => {
    getAllTasks();
    getUserInfo();
  }, []); 

  // Function to open the modal
  const handleOpenModal = () => {
    setOpenAddEditModal({
      isShown: true,
      type: "add",
      data: null
    });
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setOpenAddEditModal({
      isShown: false,
      type: "",
      data: null
    });
  };

  return (
    <div className="d-flex flex-row " style={{ background: '#f4f7fa' }}>
      {/* Sidebar Section */}
      <Sidebar1 bg="tasks"/>

      {/* Main Content Section */}
      <div className='d-flex flex-column w-100'>
        <div  style={{ background: '#fff' }}><Navbar name="Tasks" userInfo={userInfo} onSearchTask={onSearchTask} handleClearSearch={handleClearSearch} /></div>

        {/* Title and Add Button Section */}
        <div className='d-flex flex-row justify-content-between align-items-center px-4 pt-4 p-0'>
          <h2 className='fw-bold'>All Tasks</h2>
          <button 
            className='btn-custom'
            onClick={handleOpenModal}
            style={{ width: '8rem' }}
          >
            Add Task
          </button>
        </div>

        {/* Tasks Display Section */}

        <div className=' p-3 px-3 d-flex flex-row  flex-wrap gap-3'>
          <div className='d-flex flex-column gap-3 p-3 rounded mw-75 ' style={{ background: '' }}>
            <div className='p-2 px-3 rounded-1 fw-bold fs-6 '  style={{ width: '18rem', backgroundColor:"#", color:"#7161EF", border: "1px solid #C2C0FF" }}>
              TO DO
            </div>
             <div className='d-flex flex-column gap-3  '>
             {filteredTasks("TO DO").map(item => (
                <TodoTaskCard 
                  key={item._id}
                  taskId={item._id}
                  title={item.title}
                  date={moment(item.createdOn)}
                  description={item.description}
                  tags={item.tag}
                  status={item.status}
                  priority={item.priority}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteTask(item)}
                  onPinTask={() => updateIsPinned(item)}
                  onStatusChange={handleStatusChange}
                />
              ))}
              </div> 
          </div>
              
          <div className='d-flex flex-column gap-3 p-3 rounded mw-75 ' style={{ background: '' }}>
          <div className='p-2 px-3 rounded-1 fw-bold fs-6 '  style={{ width: '18rem', backgroundColor:"#", color:"#7161EF", border: "1px solid #C2C0FF" }}>
          IN PROGRESS
            </div>
             <div className='d-flex flex-column gap-3 h-100 '>
              {filteredTasks("IN PROGRESS").map(item => (
                  <InProgressTaskCard 
                  key={item._id}
                  taskId={item._id}
                  title={item.title}
                  date={moment(item.createdOn)}
                  description={item.description}
                  tags={item.tag}
                  status={item.status}
                  priority={item.priority}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteTask(item)}
                  onPinTask={() => updateIsPinned(item)}
                  onStatusChange={handleStatusChange}
                  />
                ))}
              </div> 
          </div>

          <div className='d-flex flex-column gap-3 p-3 rounded mw-50 ' style={{ background: '' }}>
            <div className='p-2 px-3 rounded-1 fw-bold fs-6 '  style={{ width: '18rem', backgroundColor:"#", color:"#7161EF", border: "1px solid #C2C0FF" }}>
              COMPLETED
            </div>
             <div className='d-flex flex-column gap-3 h-100 '>
              {filteredTasks("COMPLETED").map(item => (
                  <Completed 
                    key={item._id}
                    title={item.title}
                    date={item.createdOn}
                    description={item.description}
                    tags={item.tag}
                    status={item.status}
                    priority={item.priority}
                    isPinned={item.isPinned}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => deleteTask(item)}
                    onPinTask={() => updateIsPinned(item) }
                  />
                ))}
              </div> 
          </div>
          
        </div>

        {/* Modal Section */}
        <Modal
          isOpen={openAddEditModal.isShown}
          onRequestClose={handleCloseModal}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.5)",
            },
            content: {
              borderRadius: "10px",
              padding: "20px",
              maxWidth: "500px",
              margin: "auto",
            },
          }}
          contentLabel="Add/Edit Task Modal"
        >
          
          <AddEditTask  
            name = "New task"
            type={openAddEditModal.type}
            taskData={openAddEditModal.data}
            onClose={() => {
              setOpenAddEditModal({isShown: false, type: "add", data: null});
            }}

            getAllTasks={getAllTasks}
            ShowToastMsg={ShowToastMsg}

          />
        </Modal>

        <Toast
          isShown={showToast.isShown}
          message={showToast.message}
          type={showToast.type}
          onClose={handleCloseToast}
        />

        
      </div>

      <div className='chat-component'>
        <Chat />
      </div>
    </div>
  );
}

export default Tasks;
