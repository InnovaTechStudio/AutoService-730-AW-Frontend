/**
 * @file tracking.service.js
 * @description **Tracking Service (Infrastructure Layer)**
 */

import axios from 'axios';

const publicHttp = axios.create({
    baseURL: 'https://autoservice-aw-backend.onrender.com/api/v1',
    headers: { 'Content-type': 'application/json' }
});

export const TrackingService = {
    getOrderByCode(trackingCode) {
        return publicHttp.get(`/workorders?trackingCode=${trackingCode}`);
    },

    getVehicle(vehicleId) {
        return publicHttp.get(`/vehicles/${vehicleId}`);
    },

    getTasksByOrder(workOrderId) {
        return publicHttp.get(`/tasks?workOrderId=${workOrderId}`);
    },

    getCustomer(customerId) {
        return publicHttp.get(`/customers/${customerId}`);
    },

    getWorkshop(workshopId) {
        return publicHttp.get(`/workshops/${workshopId}`);
    },

    processPayment(workOrderId) {
        return publicHttp.patch(`/workorders/${workOrderId}`, {
            status: 'DELIVERED'
        });
    }
};
