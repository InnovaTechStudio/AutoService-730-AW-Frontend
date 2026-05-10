import { defineStore } from 'pinia';
import { MechanicService } from '../infrastructure/mechanic.service';
import { createMechanic } from '../domain/mechanic.entity';

export const useMechanicStore = defineStore('mechanic', {
    state: () => ({
        mechanics: [],
        loading: false
    }),

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

        async addMechanic(mechanicData) {
            const response = await MechanicService.create(createMechanic(mechanicData));
            this.mechanics.push(response.data);
        },

        async updateMechanic(id, mechanicData) {
            const response = await MechanicService.update(id, createMechanic(mechanicData));
            const index = this.mechanics.findIndex(m => String(m.id) === String(id));

            if (index !== -1) {
                this.mechanics.splice(index, 1, response.data);
            }
        },

        async deleteMechanic(id) {
            await MechanicService.delete(id);
            this.mechanics = this.mechanics.filter(m => String(m.id) !== String(id));
        }
    }
});