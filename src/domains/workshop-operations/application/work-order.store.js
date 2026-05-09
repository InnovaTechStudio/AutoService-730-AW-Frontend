import { defineStore } from 'pinia';
import { WorkOrderService } from '../infrastructure/work-order.service';
import { createWorkOrder } from '../domain/work-order.entity';

export const useWorkOrderStore = defineStore('workOrder', {
    state: () => ({
        workOrders: [],
        loading: false
    }),
    actions: {
        async fetchWorkOrders() {
            this.loading = true;
            try {
                const response = await WorkOrderService.getAll();
                this.workOrders = response.data.map(wo => createWorkOrder(wo));
            } finally {
                this.loading = false;
            }
        },
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