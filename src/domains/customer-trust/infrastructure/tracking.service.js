/**
 * @file tracking.service.js
 * @description **Tracking Service (Infrastructure Layer)**
 *
 * This service handles public API requests related to tracking work orders,
 * vehicles, tasks, and payments. It uses a dedicated Axios instance (`publicHttp`)
 * with a base URL pointing to the public backend.
 *
 * Responsibilities:
 * - Fetch work orders by tracking code
 * - Retrieve vehicle details and history
 * - Fetch tasks linked to a work order
 * - Process payments for completed work orders
 *
 * Layer Role:
 * - Part of the **Infrastructure Layer** in DDD
 * - Provides clean methods for the Presentation/Application layers
 * - Does not handle i18n or UI logic
 */
import axios from 'axios';

const publicHttp = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-type': 'application/json' }
});

/**
 * Tracking Service object containing all API operations
 * for public tracking and payment processes.
 */
export const TrackingService = {
    /**
     * Retrieves a work order by its tracking code.
     *
     * @param {string} trackingCode - Unique tracking code provided to the customer
     * @returns {Promise<Array<Object>>} Array containing the matched work order(s)
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

    /**
     * Retrieves vehicle details by ID.
     *
     * @param {string|number} vehicleId - Unique identifier of the vehicle
     * @returns {Promise<Object>} Vehicle data
     */
    async getVehicle(vehicleId) {
        const response = await publicHttp.get(`/vehicles/${vehicleId}`);
        return response.data;
    },

    /**
     * Retrieves tasks associated with a work order.
     *
     * @param {string|number} workOrderId - ID of the work order
     * @returns {Promise<Array<Object>>} Array of tasks linked to the work order
     */
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

    /**
     * Retrieves vehicle history by plate number.
     *
     * @param {string} plate - Vehicle plate number
     * @returns {Promise<Array<Object>>} Array of historical records
     */
    async getVehicleHistory(plate) {
        try {
            const response = await publicHttp.get(`/vehicle-history?plate=${plate}`);
            const data = response.data;
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    },

    /**
     * Processes payment for a work order.
     * Updates the work order status to "Entregado".
     *
     * @param {string|number} workOrderId - ID of the work order
     * @returns {Promise<Object>} Updated work order data
     */
    async processPayment(workOrderId) {
        const response = await publicHttp.patch(`/work-orders/${workOrderId}`, {
            status: 'Entregado'
        });
        return response.data;
    }
};
