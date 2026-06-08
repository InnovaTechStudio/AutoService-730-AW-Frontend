import axios from 'axios';

const publicHttp = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-type': 'application/json' }
});

export const TrackingService = {
    async getOrderByCode(trackingCode) {
        try {
            const response = await publicHttp.get(`/work-orders/${trackingCode}`);
            return [response.data];
        } catch (error) {
            const response = await publicHttp.get(`/work-orders?trackingCode=${trackingCode}`);
            const data = response.data;
            return Array.isArray(data) ? data : (data.data || []);
        }
    },

    async getVehicle(vehicleId) {
        const response = await publicHttp.get(`/vehicles/${vehicleId}`);
        return response.data;
    },

    async getTasks(workOrderId) {
        try {
            const response = await publicHttp.get(`/tasks?workOrderId=${workOrderId}`);
            const data = response.data;

            if (Array.isArray(data)) {
                return data.filter(task => String(task.workOrderId) === String(workOrderId));
            }

            if (data && Array.isArray(data.data)) {
                return data.data.filter(task => String(task.workOrderId) === String(workOrderId));
            }

            return [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },

    async getVehicleHistory(plate) {
        try {
            const response = await publicHttp.get(`/vehicle-history?plate=${plate}`);
            const data = response.data;
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }
};