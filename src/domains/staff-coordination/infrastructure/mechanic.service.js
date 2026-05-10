import http from '../../../shared/infrastructure/http-common';

export const MechanicService = {
    getAll() {
        return http.get('/mechanics');
    },
    create(data) {
        return http.post('/mechanics', data);
    },
    update(id, data) {
        return http.put(`/mechanics/${id}`, data);
    },
    delete(id) {
        return http.delete(`/mechanics/${id}`);
    }
};