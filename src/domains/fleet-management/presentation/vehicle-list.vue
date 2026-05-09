<template>
  <div class="container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>Flota de Vehículos</h1>
      <Button label="Registrar Vehículo" icon="pi pi-plus" severity="primary" @click="openNew" />
    </div>

    <DataTable :value="vehicleStore.vehicles" :loading="vehicleStore.loading" dataKey="id" responsiveLayout="scroll">
      <Column field="plate" header="Placa"></Column>
      <Column field="brand" header="Marca"></Column>
      <Column field="model" header="Modelo"></Column>
      <Column field="year" header="Año"></Column>
      <Column field="color" header="Color"></Column>

      <Column header="Dueño">
        <template #body="slotProps">
          {{ getCustomerName(slotProps.data.customerId) }}
        </template>
      </Column>
      <Column field="status" header="Estado">
        <template #body="slotProps">
          <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
        </template>
      </Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="info" text rounded @click="editVehicle(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="vehicleDialog" :header="vehicle.id ? 'Editar Vehículo' : 'Nuevo Vehículo'" :modal="true" class="p-fluid">
      <div class="field">
        <label for="customer">Cliente (Dueño)</label>
        <Dropdown
            id="customer"
            v-model="vehicle.customerId"
            :options="customerStore.customers"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Busca un cliente..."
            filter
        />
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="plate">Placa</label>
          <InputText id="plate" v-model.trim="vehicle.plate" required />
        </div>
        <div class="field col">
          <label for="status">Estado</label>
          <Dropdown
              id="status"
              v-model="vehicle.status"
              :options="['En Taller', 'Listo', 'Entregado']"
              placeholder="Estado"
          />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="brand">Marca</label>
          <InputText id="brand" v-model.trim="vehicle.brand" />
        </div>
        <div class="field col">
          <label for="model">Modelo</label>
          <InputText id="model" v-model.trim="vehicle.model" />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="year">Año</label>
          <InputText id="year" v-model.trim="vehicle.year" placeholder="Ej: 2024" />
        </div>
        <div class="field col">
          <label for="color">Color</label>
          <InputText id="color" v-model.trim="vehicle.color" placeholder="Ej: Rojo" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveVehicle" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useVehicleStore } from '../application/vehicle.store';
import { useCustomerStore } from '../../customer-management/application/customer.store';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

const vehicleStore = useVehicleStore();
const customerStore = useCustomerStore();
const vehicleDialog = ref(false);
const vehicle = ref({});

onMounted(async () => {
  await customerStore.fetchCustomers();
  await vehicleStore.fetchVehicles();
});

const getCustomerName = (id) => {
  const customer = customerStore.customers.find(c => String(c.id) === String(id));
  return customer ? customer.fullName : 'No asignado';
};

const getSeverity = (status) => {
  switch (status) {
    case 'En Taller': return 'warning';
    case 'Listo': return 'success';
    case 'Entregado': return 'info';
    default: return 'secondary';
  }
};

const openNew = () => {
  vehicle.value = {
    status: 'En Taller',
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    customerId: null
  };
  vehicleDialog.value = true;
};

const hideDialog = () => {
  vehicleDialog.value = false;
};

const editVehicle = (veh) => {
  vehicle.value = { ...veh };
  vehicleDialog.value = true;
};

const saveVehicle = async () => {
  if (vehicle.value.plate && vehicle.value.customerId) {
    if (vehicle.value.id) {
      await vehicleStore.updateVehicle(vehicle.value.id, vehicle.value);
    } else {
      await vehicleStore.addVehicle(vehicle.value);
    }
    vehicleDialog.value = false;
    vehicle.value = {};
  }
};
</script>