import axios from 'axios';

// Use environment variable for API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const instance = axios.create({
  baseURL: API_URL, // e.g., https://your-backend.vercel.app/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if available
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
