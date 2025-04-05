import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; 
import PasswordInput from '../../components/Input/PasswordInput';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import illustration from '../../assets/time-management-illustration.svg';
import '../../App.css'; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)){
        setError("Please enter a valid email address");
        return;
    }
    
    if(!password){
        setError("Please enter the password");
        return;
    }

    setError("");

    try {
        const response = await axiosInstance.post("/login", {
            email: email,
            password: password
        });

        if(response.data && response.data.accessToken){
            localStorage.setItem("token", response.data.accessToken);
            navigate('/home');
        }
    } catch(error) {
        if(error.response && error.response.data && error.response.data.message){
            setError(error.response.data.message);
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
    }
  };

  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-illustration-container">
          <img src={illustration} alt="Task Management" className="login-illustration" />
        </div>
        <div className="login-form-container">
          <h2 className="login-form-title">Login</h2>
          
          <form onSubmit={handleLogin}>
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
              />
            </div>
            
            {error && <p className="login-error-text">{error}</p>}
            
            <button type="submit" className="login-button">
              Login
            </button>
            
            <p className="login-signup-text">
              Don't have an account? {" "}
              <Link to="/signup" className="login-signup-link">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;