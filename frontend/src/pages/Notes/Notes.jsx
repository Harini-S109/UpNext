import React from 'react';
import Sidebar1 from '../../components/Sidebar/Sidebar1';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SubBar from '../../components/SubBar/SubBar';
import CreateFolder from '../CreateFolder/CreateFolder';
import FileExplorer from '../../components/notes/FileExplorer ';
import '../../App.css';
import Chat from '../../components/Chat/Chat';


const Notes = () => {
  const [userInfo, setUserInfo] = useState('');
  const [isCreateFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  const navigate = useNavigate();

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (

   
      
    <div className="d-flex flex-row">
    
      <Sidebar1 bg="notes"/>

      <div className="d-flex flex-column w-100 ">
        <Navbar name="Notes" userInfo={userInfo} />

        <FileExplorer />

        <Chat />
      </div>
    </div>
  );
};

export default Notes;
