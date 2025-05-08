import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import '../css/SignUp.css';
import api from '../Api/axiosinstance'; // Your axios instance
function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' // default role
    });

    const navigate = useNavigate();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
      e.preventDefault();
      const { name, email, password, role } = signupInfo;
      
      if (!name || !email || !password || !role) {
        return handleError('All fields are required');
      }
    
      try {
        const response = await api.post('/auth/signup', signupInfo, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const { success, message, error } = response.data;
    
        if (success) {
          handleSuccess(message);
          setTimeout(() => navigate('/login'), 1000);
        } else if (error) {
          handleError(error?.details[0]?.message || message);
        } else {
          handleError(message);
        }
      } catch (err) {
        handleError(err.response?.data?.message || err.message || 'Something went wrong');
      }
    };
    

    return (
        <div className={`container ${signupInfo.role}`}>

            <h1>Signup</h1>
            <form onSubmit={handleSignup}>
                <div>
                    <label>Name</label>
                    <input
                        onChange={handleChange}
                        type='text'
                        name='name'
                        placeholder='Enter your name...'
                        value={signupInfo.name}
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        onChange={handleChange}
                        type='email'
                        name='email'
                        placeholder='Enter your email...'
                        value={signupInfo.email}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        onChange={handleChange}
                        type='password'
                        name='password'
                        placeholder='Enter your password...'
                        value={signupInfo.password}
                    />
                </div>
                <div>
                    <label>Role</label>
                    <select name='role' onChange={handleChange} value={signupInfo.role}>
                        <option value='student'>Student</option>
                        <option value='teacher'>Teacher</option>
                    </select>
                </div>
                <button type='submit'>Signup</button>
                <span>Already have an account? <Link to="/login">Login</Link></span>
            </form>
            <ToastContainer />

        </div>
    );
}

export default Signup;
