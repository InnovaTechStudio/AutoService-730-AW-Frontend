import axios from 'axios';

const API_URL = 'https://autoservice-aw-backend.onrender.com/api/v1/appointments';

export default {

    async getAll() {

        const response = await axios.get(API_URL);

        return response.data;
    },

    async create(data) {

        const response = await axios.post(API_URL, data);

        return response.data;
    }
}