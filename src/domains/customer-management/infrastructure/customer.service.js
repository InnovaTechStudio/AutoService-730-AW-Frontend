import http from '../../../shared/infrastructure/http-common';

export const CustomerService = {
    getAll() {
        return http.get('/customers');
    },
    getById(id) {
        return http.get(`/customers/${id}`);
    },
    create(customerData) {
        return http.post('/customers', customerData);
    },
    update(id, data) {
        return http.put(`/customers/${id}`, data);
    }
};