import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tasks from './pages/Tasks/Tasks';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Home from './pages/Home/Home';
import Notes from './pages/Notes/Notes';
import Ai from './pages/Ai/Ai';


const routes = (
  <Router>
    <Routes>
    <Route path="/" exact element={<Login />} />
      <Route path="/tasks" exact element={<Tasks />} />
      <Route path="/home" exact element={<Home />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="/signup" exact element={<SignUp />} />
      <Route path="/notes" exact element={<Notes />} />
      <Route path="/ai" exact element={<Ai />} />
    </Routes>
  </Router>
);

const App = () => {
  return (
    <div className=''>
      {routes}
    </div>
  )
};

export default App
