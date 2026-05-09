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
        }
    }
});