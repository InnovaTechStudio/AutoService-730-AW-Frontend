/**
 * Shared Axios HTTP client configuration.
 * Adds default headers and authentication token interceptor.
 */

import axios from 'axios';

const LOCAL_API_URL = 'http://localhost:5024/api/v1';

const PRODUCTION_API_URL =
    'https://autoservice-aw-backend.onrender.com/api/v1';

/**
 * Resolves the API base URL according to the current environment.
 * VITE_API_URL can override the default URL when necessary.
 */
const getApiBaseUrl = () => {
    const configuredApiUrl =
        import.meta.env.VITE_API_URL?.trim();

    if (configuredApiUrl) {
        return configuredApiUrl.replace(/\/+$/, '');
    }

    return import.meta.env.DEV
        ? LOCAL_API_URL
        : PRODUCTION_API_URL;
};

const http = axios.create({
    baseURL: getApiBaseUrl(),
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