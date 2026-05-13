/**
 * @file customer.store.js
 * @description **Customer Store (Pinia)**
 *
 * This store manages all customer-related state and business operations in the AutoService application.
 * It follows the Domain-Driven Design (DDD) pattern:
 * - Application Layer: Orchestrates use cases and coordinates between Presentation and Infrastructure layers.
 *
 * Responsibilities:
 * - Fetching customers from the backend
 * - Creating, updating, and deleting customers
 * - Maintaining the list of customers in a reactive state
 */
import { defineStore } from 'pinia';
import { CustomerService } from '../infrastructure/customer.service';
import {Customer} from "../domain/customer.entity.js";

/**
 * Customer Management Store using Pinia.
 *
 * @typedef {Object} CustomerStoreState
 * @property {Array<Object>} customers - List of all customers
 * @property {boolean} loading - Loading state for async operations
 */
export const useCustomerStore = defineStore('customer', {

    state: () => ({
        customers: [],
        loading: false
    }),

    actions: {
        /**
         * Fetches all customers from the backend and updates the store.
         *
         * Each customer is transformed using the Customer entity to ensure
         * data consistency and business rules are applied.
         *
         * @returns {Promise<void>}
         */
        async fetchCustomers() {
            this.loading = true;

            try {
                const response = await CustomerService.getAll();

                this.customers = response.data.map(customer =>
                    Customer(customer)
                );

            } finally {
                this.loading = false;
            }
        },
        /**
         * Creates a new customer and adds it to the store.
         *
         * @param {Object} customer - Raw customer data from the form
         * @returns {Promise<Object>} The newly created customer (as entity)
         */
        async addCustomer(customer) {

            // normalizar antes de enviar
            const newCustomer = Customer(customer);

            const response = await CustomerService.create(newCustomer);

            // normalizar respuesta
            const savedCustomer = Customer(response.data);

            this.customers.push(savedCustomer);

            return savedCustomer;
        },
        /**
         * Updates an existing customer's information.
         *
         * @param {string|number} id - ID of the customer to update
         * @param {Object} customerData - Updated customer data
         * @returns {Promise<void>}
         */
        async updateCustomer(id, customerData) {

            try {

                const updatedCustomer = Customer(customerData);

                const response = await CustomerService.update(id, updatedCustomer);

                const customerFromApi = Customer(response.data);

                const index = this.customers.findIndex(
                    c => String(c.id) === String(id)
                );

                if (index !== -1) {
                    this.customers.splice(index, 1, customerFromApi);
                }

            } catch (error) {
                console.error('Error al actualizar cliente:', error);
            }
        },
        /**
         * Deletes a customer by ID and removes it from the local state.
         *
         * @param {string|number} id - ID of the customer to delete
         * @returns {Promise<void>}
         */
        async deleteCustomer(id) {

            try {

                await CustomerService.delete(id);

                this.customers = this.customers.filter(
                    c => String(c.id) !== String(id)
                );

            } catch (error) {
                console.error('Error al eliminar cliente:', error);
            }
        }
    }
});