import http from '../../../shared/infrastructure/http-common';

export const InventoryService = {
    getAll() {
        return http.get('/inventory-items');
    },

    getByWorkshop(workshopId) {
        return http.get('/inventory-items', {
            params: { workshopId }
        });
    },

    create(data) {
        return http.post('/inventory-items', data);
    },

    update(id, data) {
        return http.put(`/inventory-items/${id}`, data);
    },

    patch(id, data) {
        return http.patch(`/inventory-items/${id}`, data);
    },

    delete(id) {
        return http.delete(`/inventory-items/${id}`);
    }
};