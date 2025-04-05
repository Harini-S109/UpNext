import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; 
import PasswordInput from '../../components/Input/PasswordInput';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import illustration from '../../assets/time-management-illustration.svg';
import '../../App.css'; // Import the CSS file

const Signup = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if(!name){
        setError("Please enter your name");
        return;
    }

    if(!validateEmail(email)){
        setError("Please enter a valid email address");
        return;
    }
    
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setError("");

    try{
        const response = await axiosInstance.post("/create-account", {
            fullName: name,
            email : email,
            password : password
        })

        //to handle successful sign up
        if(response.data && response.data.error){
            setError(response.data.message)
            return;
        }

        if(response.data && response.data.accessToken){
            localStorage.setItem("token", response.data.accessToken)
            navigate("/tasks");
        }

        }catch(error){
            if(error.response && error.response.data && error.response.data.message){
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.")
            }
        }
    }

  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-illustration-container">
          <img src={illustration} alt="Task Management" className="login-illustration" />
        </div>
        <div className="login-form-container">
          <h2 className="login-form-title">Sign Up</h2>
          
          <form onSubmit={handleSignup}>
            <div className="login-input-group">
              <input 
                className="login-input"
                type="text" 
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div className="login-input-group">
              <input 
                className="login-input"
                type="email" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="login-input-group">
              <PasswordInput 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                customClassName="login-input"
                placeholder="Create password"
              />
            </div>
            
            {error && <p className="login-error-text">{error}</p>}
            
            <button type="submit" className="login-button">
              Sign Up
            </button>
            
            <p className="login-signup-text">
              Already have an account? {" "}
              <Link to="/login" className="login-signup-link">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;