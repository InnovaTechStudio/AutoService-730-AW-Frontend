import axios from 'axios';
/**
 * Service to handle customer tracking operations.
 * Connects to the local mock backend to fetch work orders, vehicles, and tasks.
 */

const publicHttp = axios.create({
    baseURL: 'https://autoservice-api.ddns.net/',
    headers: { 'Content-type': 'application/json' }
});
/**
 * Fetches a work order either by its database ID or its user-friendly tracking code.
 * @param {string} trackingCode - The ID or tracking code (e.g., 'AS-1003C')
 * @returns {Promise<Array>} Array containing the matched work order(s)
 */
export const TrackingService = {
    async getOrderByCode(trackingCode) {
        const response = await publicHttp.get(`/work-orders?trackingCode=${trackingCode}`);
        return Array.isArray(response.data) ? response.data : [];
    },

    /**
     * Fetches the vehicle details linked to a work order.
     * @param {string} vehicleId - The ID of the vehicle
     * @returns {Promise<Object>} Vehicle data object
     */

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
        const response = await publicHttp.get(`/tasks?workOrderId=${workOrderId}`);
        return Array.isArray(response.data) ? response.data : [];
    },

    /**
     * Fetches technical history records using the vehicle plate.
     * @param {string} plate - Vehicle plate
     * @returns {Promise<Array>}
     */
    async getVehicleHistory(plate) {
        const response = await publicHttp.get(`/vehicle-history?plate=${plate}`);
        return Array.isArray(response.data) ? response.data : [];
    }
};







