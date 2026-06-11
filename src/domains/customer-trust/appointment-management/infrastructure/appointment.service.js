import axios from 'axios';

const API_URL = 'http://localhost:3000/appointments';

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