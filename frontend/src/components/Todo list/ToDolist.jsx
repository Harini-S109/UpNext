import React, { useEffect, useState } from "react";
import { FaRegCircle } from "react-icons/fa6";
import axiosInstance from "../../utils/axiosInstance";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import "../../App.css";



const ToDoList = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to filter tasks by status
  const filteredTasks = (status) => allTasks.filter((task) => task.status === status);

  // Function to change task status to "COMPLETED"
  const changeTaskToComplete = async (taskId) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/edit-task/${taskId}`, {
        status: "COMPLETED",
      });

      if (response.data && response.data.task) {
        // Update local state to reflect the change
        setAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: "COMPLETED" } : task
          )
        );
      }
    } catch (error) {
      setError("Failed to update task status. Please try again.");
      console.error("Error updating task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch all tasks from the API
  const getAllTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get("/get-all-tasks");

      if (response.data && response.data.tasks) {
        setAllTasks(response.data.tasks);
      }
    } catch (error) {
      setError("An error occurred while fetching tasks. Please try again.");
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    getAllTasks();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const todoTasks = filteredTasks("TO DO");
  const inProgressTasks = filteredTasks("IN PROGRESS");
  const completedTasks = filteredTasks("COMPLETED");


  return (
    <div className=" ">
      <h4 className="fw-semibold">My Tasks</h4>

      {/* To-Do Tasks Section */}
      <ul className="list-unstyled d-flex flex-column gap-2 pt-2">
        {todoTasks.length > 0 ? (
          todoTasks.map((item) => (
            <li
              key={item._id}
              className="d-flex flex-row gap-2 align-items-center border border-dark p-2 rounded"
            >
              <button
                className="border-0 p-0 bg-light"
                onClick={() => changeTaskToComplete(item._id)} // Change task to "COMPLETED"
                disabled={isUpdating}
              >
                <FaRegCircle
                  className="text-gray-400 flex-shrink-0"
                  size={16}
                />
              </button>
              <span className="flex-1">{item.title}</span>
            </li>
          ))
        )       
        : (
          <div className="text-gray-500"></div>
        )}

        {inProgressTasks.length > 0 ? (
          inProgressTasks.map((item) => (
            <li
              key={item._id}
              className="d-flex flex-row gap-2 align-items-center border border-dark p-2 rounded"
            >
              <button
                className="border-0 p-0 bg-light"
                onClick={() => changeTaskToComplete(item._id)} // Change task to "COMPLETED"
                disabled={isUpdating}
              >
                <FaRegCircle
                  className="text-gray-400 flex-shrink-0"
                  size={16}
                />
              </button>
              <span className="flex-1">{item.title}</span>
            </li>
          ))
        )       
        : (
          <div className="text-gray-500"></div>
        )}

        {completedTasks.length > 0 ? (
          completedTasks.map((item) => (
            <li
              key={item._id}
              className="d-flex flex-row gap-2 align-items-center border border-dark p-2 rounded"
            >
              <button
                className="border-0 p-0 bg-light"
                onClick={() => changeTaskToComplete(item._id)} // Change task to "COMPLETED"
                disabled={isUpdating}
              >
                <IoIosCheckmarkCircleOutline
                  className="text-gray-400 flex-shrink-0"
                  size={20}
                />
              </button>
              <span className="flex-1">{item.title}</span>
            </li>
          ))
        )       
        : (
          <div className="text-gray-500"></div>
        )}

      </ul>
    </div>
  );
};

export default ToDoList;
