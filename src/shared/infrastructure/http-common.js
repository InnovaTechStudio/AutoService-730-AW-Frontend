import axios from 'axios';

const http = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-type': 'application/json' }
});

http.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || config.url.includes('/workshops')) {
        return config;
    }

    const workshopId = user.role === 'mechanic'
        ? user.workshopId
        : user.id;

    if (!workshopId) {
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