import http from '../../../shared/infrastructure/http-common';

export const WorkOrderService = {
    getAll() {
        return http.get('/work-orders');
    },
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