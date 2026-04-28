import axios from 'axios';

// In production VITE_API_URL = https://your-backend.onrender.com/api
// In dev the Vite proxy handles /api → localhost:5000
const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fds_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('fds_token');
            localStorage.removeItem('fds_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
