import axios from 'axios';

const publicHttp = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-type': 'application/json' }
});

export const TrackingService = {
    async getOrderByCode(trackingCode) {
        const response = await publicHttp.get(`/work-orders?trackingCode=${trackingCode}`);
        const data = response.data;


        return Array.isArray(data) ? data : (data.data || []);
    },

    async getVehicle(vehicleId) {
        const response = await publicHttp.get(`/vehicles/${vehicleId}`);
        return response.data;
    },

    async getTasks(workOrderId) {
        try {
            const response = await publicHttp.get(`/tasks?workOrderId=${workOrderId}`);


            let tasksArray = [];

            if (Array.isArray(response.data)) {
                tasksArray = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                tasksArray = response.data.data;
            } else if (typeof response.data === 'object' && response.data !== null) {
                tasksArray = [response.data];
            } else {
                return [];
            }


            return tasksArray.filter(task => String(task.workOrderId) === String(workOrderId));

        } catch (error) {
            console.error("Error obteniendo tareas:", error);
            return [];
        }
    }
};