import { defineStore } from 'pinia';
import { InventoryService } from '../infrastructure/inventory.service';
import { createInventoryItem } from '../domain/inventory-item.entity';

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        items: [],
        loading: false,
        error: null
    }),

    getters: {
        lowStockItems: (state) =>
            state.items.filter(item => Number(item.stock) <= Number(item.minStock)),

        availableItems: (state) =>
            state.items.filter(item => item.status === 'Disponible' && Number(item.stock) > 0)
    },

    actions: {
        async fetchInventory(workshopId = null) {
            this.loading = true;
            this.error = null;

            try {
                const response = workshopId
                    ? await InventoryService.getByWorkshop(workshopId)
                    : await InventoryService.getAll();

                this.items = response.data.map(item => createInventoryItem(item));
            } catch (error) {
                this.error = 'No se pudo cargar el inventario';
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        async addItem(itemData) {
            const newItem = createInventoryItem({
                ...itemData,
                lastUpdated: new Date().toISOString()
            });

            const response = await InventoryService.create(newItem);
            this.items.push(createInventoryItem(response.data));
            return response.data;
        },

        async updateItem(id, itemData) {
            const response = await InventoryService.update(id, {
                ...itemData,
                lastUpdated: new Date().toISOString()
            });

            const index = this.items.findIndex(item => String(item.id) === String(id));

            if (index !== -1) {
                this.items.splice(index, 1, createInventoryItem(response.data));
            }

            return response.data;
        },

        async discountStock(id, quantity) {
            const item = this.items.find(item => String(item.id) === String(id));

            if (!item) return null;

            const newStock = Math.max(Number(item.stock) - Number(quantity), 0);

            const response = await InventoryService.patch(id, {
                stock: newStock,
                lastUpdated: new Date().toISOString()
            });

            const index = this.items.findIndex(item => String(item.id) === String(id));

            if (index !== -1) {
                this.items.splice(index, 1, createInventoryItem(response.data));
            }

            return response.data;
        }
    }
});