/**
 * Service layer for inventory API communication.
 */
import http from '../../../shared/infrastructure/http-common';

export const InventoryService = {
    /**
     * Fetch all inventory items.
     * @returns {Promise}
     */
    getAll() {
        return http.get('/inventoryitems');
    },

    /**
     * Fetch a single inventory item by ID.
     * @param {number|string} id
     * @returns {Promise}
     */
    getById(id) {
        return http.get(`/inventoryitems/${id}`);
    },

    /**
     * Create a new inventory item.
     * @param {Object} data
     * @returns {Promise}
     */
    create(data) {
        return http.post('/inventoryitems', data);
    },

    /**
     * Update an existing inventory item.
     * @param {number|string} id
     * @param {Object} data
     * @returns {Promise}
     */
    update(id, data) {
        return http.put(`/inventoryitems/${id}`, data);
    },

    /**
     * Delete an inventory item by ID.
     * @param {number|string} id
     * @returns {Promise}
     */
    delete(id) {
        return http.delete(`/inventoryitems/${id}`);
    }
};