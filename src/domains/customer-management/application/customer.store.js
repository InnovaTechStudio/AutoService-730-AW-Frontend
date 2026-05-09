import { defineStore } from 'pinia';
import { CustomerService } from '../infrastructure/customer.service';

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
                this.customers = response.data;
            } finally {
                this.loading = false;
            }
        },
        async addCustomer(customer) {
            const response = await CustomerService.create(customer);
            this.customers.push(response.data);
            return response.data;
        },
        async updateCustomer(id, customerData) {
            try {
                const response = await CustomerService.update(id, customerData);
                const index = this.customers.findIndex(c => String(c.id) === String(id));
                if (index !== -1) {
                    this.customers.splice(index, 1, response.data);
                }
            } catch (error) {
                console.error("Error al actualizar cliente:", error);
            }
        }
    }
});