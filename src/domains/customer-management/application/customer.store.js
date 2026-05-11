import { defineStore } from 'pinia';
import { CustomerService } from '../infrastructure/customer.service';
import {Customer} from "../domain/customer.entity.js";

export const useCustomerStore = defineStore('customer', {

    state: () => ({
        customers: [],
        loading: false
    }),

    actions: {

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

        async addCustomer(customer) {

            // normalizar antes de enviar
            const newCustomer = Customer(customer);

            const response = await CustomerService.create(newCustomer);

            // normalizar respuesta
            const savedCustomer = Customer(response.data);

            this.customers.push(savedCustomer);

            return savedCustomer;
        },

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