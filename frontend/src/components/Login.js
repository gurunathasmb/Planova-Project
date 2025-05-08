import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import '../css/Login.css';
import api from '../Api/axiosinstance'; // Your axios instance
function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: '',
        role: 'student' // default role
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      const { email, password, role } = loginInfo;
      if (!email || !password || !role) {
        return handleError('All fields are required');
      }
    
      try {
        const response = await api.post('/auth/login', loginInfo, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const { success, message, token, user, error } = response.data;
    
        if (success) {
          handleSuccess(message);
          localStorage.setItem('token', token);
          localStorage.setItem('loggedInUser', JSON.stringify(user));
          setTimeout(() => {
            if (user.role === 'student') {
              navigate('/student/dashboard');
            } else {
              navigate('/teacher/dashboard');
            }
          }, 1000);
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
        <div className={`container ${loginInfo.role}`}>

            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email</label>
                    <input
                        onChange={handleChange}
                        type='email'
                        name='email'
                        placeholder='Enter your email...'
                        value={loginInfo.email}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        onChange={handleChange}
                        type='password'
                        name='password'
                        placeholder='Enter your password...'
                        value={loginInfo.password}
                    />
                </div>
                <div>
                    <label>Role</label>
                    <select name='role' onChange={handleChange} value={loginInfo.role}>
                        <option value='student'>Student</option>
                        <option value='teacher'>Teacher</option>
                    </select>
                </div>
                <button type='submit'>Login</button>
                <span>Don't have an account? <Link to="/signup">Signup</Link></span>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Login;
