import axios from 'axios';

const publicHttp = axios.create({
    //baseURL: import.meta.env.VITE_API_URL,
    baseURL: 'http://localhost:3000',
    headers: { 'Content-type': 'application/json' }
});

/**
 * Service to handle customer tracking operations.
 * Connects to the local mock backend to fetch work orders, vehicles, and tasks.
 */
export const TrackingService = {
    /**
     * Fetches a work order either by its database ID or its user-friendly tracking code.
     * @param {string} trackingCode - The ID or tracking code (e.g., 'AS-1003C')
     * @returns {Promise<Array>} Array containing the matched work order(s)
     */
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
<<<<<<< HEAD
=======

    /**
     * Fetches the vehicle details linked to a work order.
     * @param {string} vehicleId - The ID of the vehicle
     * @returns {Promise<Object>} Vehicle data object
     */
>>>>>>> 30a4abe (feat(customer-trust): implement dynamic vehicle image syncing and dark mode UI)
    async getVehicle(vehicleId) {
        const response = await publicHttp.get(`/vehicles/${vehicleId}`);
        return response.data;
    },

    /**
     * Fetches all tasks associated with a specific work order to build the timeline.
     * @param {string} workOrderId - The ID of the root work order
     * @returns {Promise<Array>} Array of filtered task objects
     */
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
            console.error("Error fetching tasks:", error);
            return [];
        }
    }
};