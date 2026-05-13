/**
 * @file work-order.service.js
 * @description Infrastructure service for Work Order API communications.
 * This file acts as the 'Messenger' that talks to the backend server.
 * It uses the 'http' common configuration to send and receive data.
 * @module WorkOrderService
 */
import http from '../../../shared/infrastructure/http-common';

export const WorkOrderService = {
    /**
     * Retrieves the complete list of work orders from the server.
     *
     * @function getAll
     * @description Sends a GET request to the '/work-orders' endpoint.
     * @returns {Promise<AxiosResponse>} A promise containing the list of all work orders.
     */
    getAll() {
        return http.get('/work-orders');
    },
    /**
     * Sends a new work order to be saved in the database.
     *
     * @function create
     * @param {Object} data - The formal Work Order Entity to be stored.
     * @description Sends a POST request to the '/work-orders' endpoint with the order data.
     * @returns {Promise<AxiosResponse>} A promise containing the server's confirmation and the saved record.
     */
    create(data) {
        return http.post('/work-orders', data);
    },
    update(id, data) {
        return http.put(`/work-orders/${id}`, data);
    },

    getTasksByWorkOrder(workOrderId) {
        return http.get(`/tasks?workOrderId=${workOrderId}`);
    }
};

