/**
 * @file mechanic.service.js
 * @description **Mechanic Service (Infrastructure Layer)**
 *
 * This service acts as the data access layer for mechanics. It encapsulates all
 * HTTP requests to the backend related to staff members (mechanics), following
 * the Repository pattern in Domain-Driven Design (DDD).
 *
 * Part of the **Staff Coordination** domain - Infrastructure Layer.
 *
 * This service abstracts API communication so that the Application Layer
 * (mechanic.store.js) and Presentation Layer can work with a clean interface.
 */
import http from '../../../shared/infrastructure/http-common';
/**
 * Mechanic Service object containing all API operations for mechanics.
 *
 * Provides CRUD methods for managing workshop mechanics (staff members).
 * The shared HTTP interceptor automatically adds `workshopId` filtering where needed.
 */
export const MechanicService = {
    /**
     * Retrieves all mechanics from the backend.
     *
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to an array of mechanics
     */
    getAll() {
        return http.get('/mechanics');
    },
    /**
     * Creates a new mechanic in the backend.
     *
     * @param {Object} data - Mechanic entity data to be created
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created mechanic
     */
    create(data) {
        return http.post('/mechanics', data);
    },
    /**
     * Updates an existing mechanic's information.
     *
     * @param {string|number} id - ID of the mechanic to update
     * @param {Object} data - Updated mechanic data
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated mechanic
     */
    update(id, data) {
        return http.put(`/mechanics/${id}`, data);
    },
    /**
     * Deletes a mechanic by ID.
     *
     * @param {string|number} id - ID of the mechanic to delete
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the API response
     */
    delete(id) {
        return http.delete(`/mechanics/${id}`);
    }
};