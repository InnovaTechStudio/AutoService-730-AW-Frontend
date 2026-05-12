/**
 * @file vehicle.store.js
 * @description **Vehicle Store (Pinia)**
 *
 * This store manages all vehicle-related state and business operations in the AutoService application.
 * It belongs to the **Fleet Management** domain and follows the Domain-Driven Design (DDD) architecture:
 * - Application Layer: Coordinates use cases and interacts with the Infrastructure layer (services).
 *
 * Responsibilities:
 * - Fetching vehicles from the backend
 * - Adding new vehicles
 * - Updating existing vehicles
 * - Maintaining a reactive list of vehicles for the UI
 */
import { defineStore } from 'pinia';
import { VehicleService } from '../infrastructure/vehicle.service';
import { createVehicle } from '../domain/vehicle.entity';

/**
 * Vehicle Store definition using Pinia.
 *
 * @typedef {Object} VehicleStoreState
 * @property {Array<Object>} vehicles - List of all vehicles in the workshop
 * @property {boolean} loading - Loading state for async operations
 */
export const useVehicleStore = defineStore('vehicle', {
    state: () => ({
        vehicles: [],
        loading: false
    }),
    actions: {
        /**
         * Fetches all vehicles from the backend and updates the store.
         *
         * Each raw vehicle from the API is transformed using the `createVehicle`
         * factory function to ensure data consistency and apply domain rules.
         *
         * @returns {Promise<void>}
         */
        async fetchVehicles() {
            this.loading = true;
            try {
                const response = await VehicleService.getAll();
                this.vehicles = response.data.map(v => createVehicle(v));
            } catch (error) {
                console.error("Error al cargar vehículos:", error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Creates a new vehicle and adds it to the local state.
         *
         * @param {Object} vehicleData - Raw vehicle data (from form)
         * @returns {Promise<Object>} The created vehicle returned from the API
         */
        async addVehicle(vehicleData) {
            try {
                const vehicle = createVehicle(vehicleData);
                const response = await VehicleService.create(vehicle);
                this.vehicles.push(response.data);
                return response.data;
            } catch (error) {
                console.error("Error al crear vehículo:", error);
                throw error;
            }
        },

        /**
         * Updates an existing vehicle's information.
         *
         * @param {string|number} id - ID of the vehicle to update
         * @param {Object} vehicleData - Updated vehicle data
         * @returns {Promise<void>}
         */
        async updateVehicle(id, vehicleData) {
            try {
                const response = await VehicleService.update(id, vehicleData);
                const index = this.vehicles.findIndex(v => String(v.id) === String(id));
                if (index !== -1) {
                    this.vehicles.splice(index, 1, response.data);
                }
            } catch (error) {
                console.error("Error al actualizar vehículo:", error);
            }
        }
    }
});