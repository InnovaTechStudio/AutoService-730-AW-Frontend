/**
 * Shared Axios HTTP client configuration.
 * Adds default headers and authentication token interceptor.
 */

import axios from 'axios';

const http = axios.create({
    baseURL: 'http://localhost:5024/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Injects JWT token into outgoing requests.
 */
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