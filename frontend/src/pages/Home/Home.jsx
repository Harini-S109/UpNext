import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar1 from '../../components/Sidebar/Sidebar1';
import Chat from '../../components/Chat/Chat';
import Navbar from '../../components/Navbar/Navbar';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import ToDolist from '../../components/Todo list/ToDolist';
import "../../App.css";
import Remainder from '../../components/Remainder/Remainder';

const Home = () => {


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
            <Sidebar1 bg="home"/>

            <div className='d-flex flex-column w-100'>
                <Navbar name="Home" userInfo={userInfo}/>

                <div className='d-flex flex-column px-4 pt-4 pb-2' style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <h1 className='fw-bold lh-1'>{getGreeting()}, {userInfo?.fullName || ''}</h1>
                    <p className='text-secondary'>{moment(currentDate).format('dddd, Do MMMM YYYY')}</p>
                </div>

                <div className="d-flex flex-column flex-md-row flex-wrap gap-2">
                    <div className='d-flex flex-row  flex-wrap w-100 gap-4 px-4 '>
                        <div className=' p-3 py-4 d-flex flex-column align-items-center rounded gap-2' style={{ width: '18rem', backgroundColor:"#7161EF" }}>
                            <h3 className='text-light'>Total tasks</h3>  
                            <h1 className='text-light'>{taskStats.total}</h1>
                        </div>
                        <div className=' p-3 py-4 d-flex flex-column align-items-center rounded gap-2' style={{ width: '18rem', backgroundColor:"#7161EF" }}>
                            <h3 className='text-light'>To-do tasks</h3>
                            <h1 className='text-light'>{taskStats.todo}</h1> 
                        </div>
                        <div className=' p-3 py-4 d-flex flex-column align-items-center rounded gap-2' style={{ width: '18rem', backgroundColor:"#7161EF" }}>
                            <h3 className='text-light'>In-progress tasks</h3>
                            <h1 className='text-light'>{taskStats.inProgress}</h1>
                        </div>
                        <div className=' p-3 py-4 d-flex flex-column align-items-center rounded gap-2' style={{ width: '18rem', backgroundColor:"#7161EF" }} >
                            <h3 className='text-light'>Completed tasks</h3>
                            <h1 className='text-light'>{taskStats.completed}</h1>
                        </div>
                    </div>

                    <div className='d-flex flex-row gap- flex-wrap'>
                        <div className='p-4'>
                            <ToDolist />
                        </div>

                        <div>
                            <Remainder />
                        </div>
                    </div>
                </div>

                <Chat />

            </div>
        </div>
    );
};

export default Home;