import axios from 'axios';

const publicHttp = axios.create({
    // Corregido: Se quitó el slash (/) extra al final de la URL
    baseURL: 'https://autoservice-api.ddns.net',
    headers: { 'Content-type': 'application/json' }
});

/**
 * Service to handle customer tracking operations.
 */
export const TrackingService = {
    async getOrderByCode(trackingCode) {
        try {
            // Lógica robusta restaurada de main
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
            // Parseo avanzado restaurado de main (esto soluciona que no carguen las fotos)
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
            console.error("Error fetching tasks:", error);
            return [];
        }
    },

    async getVehicleHistory(plate) {
        try {
            const response = await publicHttp.get(`/vehicle-history?plate=${plate}`);
            const data = response.data;
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            return [];
        }
    }
};