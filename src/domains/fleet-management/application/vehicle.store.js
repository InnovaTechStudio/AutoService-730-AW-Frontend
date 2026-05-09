import { defineStore } from 'pinia';
import { VehicleService } from '../infrastructure/vehicle.service';
import { createVehicle } from '../domain/vehicle.entity';

export const useVehicleStore = defineStore('vehicle', {
    state: () => ({
        vehicles: [],
        loading: false
    }),
    actions: {
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