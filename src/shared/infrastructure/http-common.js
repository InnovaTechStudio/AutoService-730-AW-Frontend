import axios from 'axios';

export const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:5024/api/v1'
    : 'https://autoservice-aw-backend.onrender.com/api/v1';

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default http;