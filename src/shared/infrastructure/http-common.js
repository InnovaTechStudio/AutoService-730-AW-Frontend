import axios from 'axios';

const http = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
    baseURL: 'https://autoservice-api.ddns.net/',
    headers: { 'Content-type': 'application/json' }
});

http.interceptors.request.use((config) => {
    const workshopId = JSON.parse(localStorage.getItem('user'))?.id;
    if (!workshopId || config.url.includes('/workshops')) {
        return config;
    }
    if (config.method === 'get') {
        config.params = { ...config.params, workshopId };
    } else if (['post', 'put', 'patch'].includes(config.method)) {
        config.data = { ...config.data, workshopId };
    }

    return config;
});

export default http;
