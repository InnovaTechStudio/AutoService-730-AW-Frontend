import http from '../../../shared/infrastructure/http-common';

export const VehicleService = {
    getAll() {
        return http.get('/vehicles');
    },
    getById(id) {
        return http.get(`/vehicles/${id}`);
    },
    create(vehicleData) {
        return http.post('/vehicles', vehicleData);
    },
    update(id, vehicleData) {
        return http.put(`/vehicles/${id}`, vehicleData);
    }
};