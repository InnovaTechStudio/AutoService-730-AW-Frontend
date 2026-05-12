/**
 * @file mechanic.store.js
 * @description **Mechanic Store (Pinia)**
 *
 * This store manages all mechanic-related state and business operations in the AutoService application.
 * It belongs to the **Staff Coordination** domain and follows the Domain-Driven Design (DDD) architecture:
 * - Application Layer: Orchestrates use cases and coordinates between the Presentation layer and Infrastructure services.
 *
 * Responsibilities:
 * - Fetching mechanics from the backend
 * - Adding, updating, and deleting mechanics
 * - Maintaining a reactive list of mechanics for task assignment and staff management
 */
import { defineStore } from 'pinia';
import { MechanicService } from '../infrastructure/mechanic.service';
import { createMechanic } from '../domain/mechanic.entity';

/**
 * Mechanic Store definition using Pinia.
 *
 * @typedef {Object} MechanicStoreState
 * @property {Array<Object>} mechanics - List of all mechanics
 * @property {boolean} loading - Loading state for async operations
 */
export const useMechanicStore = defineStore('mechanic', {
    state: () => ({
        mechanics: [],
        loading: false
    }),

    /**
     * Fetches all mechanics from the backend and updates the store.
     *
     * Each raw mechanic from the API is transformed using the `createMechanic`
     * factory function to ensure data consistency and apply domain rules.
     *
     * @returns {Promise<void>}
     */
    actions: {
        async fetchMechanics() {
            this.loading = true;
            try {
                const response = await MechanicService.getAll();
                this.mechanics = response.data.map(m => createMechanic(m));
            } finally {
                this.loading = false;
            }
        },

        /**
         * Creates a new mechanic and adds it to the store.
         *
         * @param {Object} mechanicData - Raw mechanic data (from form)
         * @returns {Promise<Object>} The created mechanic returned from the API
         */
        async addMechanic(mechanicData) {
            const response = await MechanicService.create(createMechanic(mechanicData));
            this.mechanics.push(response.data);
        },

        /**
         * Updates an existing mechanic's information.
         *
         * @param {string|number} id - ID of the mechanic to update
         * @param {Object} mechanicData - Updated mechanic data
         * @returns {Promise<void>}
         */
        async updateMechanic(id, mechanicData) {
            const response = await MechanicService.update(id, createMechanic(mechanicData));
            const index = this.mechanics.findIndex(m => String(m.id) === String(id));

            if (index !== -1) {
                this.mechanics.splice(index, 1, response.data);
            }
        },

        /**
         * Deletes a mechanic by ID and removes it from the local state.
         *
         * @param {string|number} id - ID of the mechanic to delete
         * @returns {Promise<void>}
         */
        async deleteMechanic(id) {
            await MechanicService.delete(id);
            this.mechanics = this.mechanics.filter(m => String(m.id) !== String(id));
        }
    }
});