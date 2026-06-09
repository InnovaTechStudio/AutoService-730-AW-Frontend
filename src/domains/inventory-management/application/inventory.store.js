import { defineStore } from 'pinia';
import { InventoryService } from '../infrastructure/inventory.service';
import { createInventoryItem } from '../domain/inventory-item.entity';

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        items: [],
        loading: false
    }),

    actions: {
        /**
         * Fetch all inventory items
         */
        async fetchItems() {
            this.loading = true;

            try {
                const response = await InventoryService.getAll();
                this.items = response.data.map(item => createInventoryItem(item));
            } catch (error) {
                console.error('Error cargando inventario:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Add new inventory item
         * @param {Object} itemData
         */
        async addItem(itemData) {
            const newItem = createInventoryItem(itemData);
            const response = await InventoryService.create(newItem);

            this.items.push(createInventoryItem(response.data));
        },

        /**
         * Update inventory item
         * @param {string|number} id
         * @param {Object} itemData
         */
        async updateItem(id, itemData) {
            const response = await InventoryService.update(
                id,
                createInventoryItem(itemData)
            );

            const index = this.items.findIndex(i => String(i.id) === String(id));

            if (index !== -1) {
                this.items.splice(index, 1, createInventoryItem(response.data));
            }
        },

        /**
         * Delete inventory item
         * @param {string|number} id
         */
        async deleteItem(id) {
            await InventoryService.delete(id);

            this.items = this.items.filter(
                i => String(i.id) !== String(id)
            );
        }
    }
});