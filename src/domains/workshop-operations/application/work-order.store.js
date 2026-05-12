/**
 * @file work-order.store.js
 * @description State management for Work Order operations using Pinia.
 * This store serves as the central hub for managing the lifecycle of work orders,
 * including loading them from the server, adding new ones, and updating existing records.
 * @module WorkOrderStore
 */
import { defineStore } from 'pinia';
import { WorkOrderService } from '../infrastructure/work-order.service';
import { createWorkOrder } from '../domain/work-order.entity';

export const useWorkOrderStore = defineStore('workOrder', {
    state: () => ({
        workOrders: [],
        loading: false
    }),
    actions: {
        /**
         * Retrieves all work orders from the external database.
         *
         * @async
         * @function fetchWorkOrders
         * @description Requests the full list of work orders from the Infrastructure layer,
         * transforms them into formal Work Order Entities, and saves them to the store memory.
         * @returns {Promise<void>}
         */
        async fetchWorkOrders() {
            this.loading = true;
            try {
                const response = await WorkOrderService.getAll();
                this.workOrders = response.data.map(wo => createWorkOrder(wo));
            } finally {
                this.loading = false;
            }
        },
        /**
         * Creates and saves a new work order.
         *
         * @async
         * @function addWorkOrder
         * @param {Object} woData - The raw information for the new work order (provided by a user form).
         * @description Validates the data as an Entity, sends it to the server to be saved permanently,
         * and then adds the newly created order to the local list so the user can see it immediately.
         * @returns {Promise<Object>} The data of the newly created work order as confirmed by the server.
         */
        async addWorkOrder(woData) {
            this.loading = true;
            try {
                const newWo = createWorkOrder(woData);
                const response = await WorkOrderService.create(newWo);
                this.workOrders.push(response.data);
                return response.data;
            } finally {
                this.loading = false;
            }
        },
        /**
         * Updates the information of an existing work order.
         *
         * @async
         * @function updateWorkOrder
         * @param {number|string} id - The unique ID of the work order to be modified.
         * @param {Object} woData - The updated information for the work order.
         * @description Syncs the changes with the server and updates the specific item in the local
         * list without having to reload the entire list from scratch.
         * @returns {Promise<void>}
         */
        async updateWorkOrder(id, woData) {
            try {
                const response = await WorkOrderService.update(id, woData);
                const index = this.workOrders.findIndex(wo => String(wo.id) === String(id));
                if (index !== -1) {
                    this.workOrders.splice(index, 1, createWorkOrder(response.data));
                }
            } catch (error) {
                console.error("Error al actualizar la orden de trabajo:", error);
            }
        }
    }
});