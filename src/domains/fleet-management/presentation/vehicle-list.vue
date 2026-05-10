<template>
  <div class="container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>{{t('vehicles.title')}}</h1>
      <Button :label="t('vehicles.addButton')" icon="pi pi-plus" severity="primary" @click="openNew" />
    </div>

    <DataTable :value="vehicleStore.vehicles" :loading="vehicleStore.loading" dataKey="id" responsiveLayout="scroll">
      <Column field="plate" :header="t('vehicles.colPlate')"></Column>
      <Column field="brand" :header="t('vehicles.colBrand')"></Column>
      <Column field="model" :header="t('vehicles.colModel')"></Column>
      <Column field="year" :header="t('vehicles.colYear')"></Column>
      <Column field="color" :header="t('vehicles.colColor')"></Column>

      <Column :header="t('vehicles.colOwner')">
        <template #body="slotProps">
          {{ getCustomerName(slotProps.data.customerId) }}
        </template>
      </Column>
      <Column field="status" :header="t('vehicles.colStatus')">
        <template #body="slotProps">
          <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
        </template>
      </Column>
      <Column :header="t('vehicles.colActions')">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="info" text rounded @click="editVehicle(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="vehicleDialog" :header="vehicle.id ? t('vehicles.dialogTitleEdit') : t('vehicles.dialogTitleNew')" :modal="true" class="p-fluid">
      <div class="field">
        <label for="customer">{{t('vehicles.labelCustomer')}}</label>
        <Dropdown
            id="customer"
            v-model="vehicle.customerId"
            :options="customerStore.customers"
            optionLabel="fullName"
            optionValue="id"
            :placeholder="t('common.searchCustomer')"
            filter
        />
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="plate">{{ t('vehicles.labelPlate') }}</label>
          <InputText id="plate" v-model.trim="vehicle.plate" required />
        </div>
        <div class="field col">
          <label for="status">{{t('vehicles.labelStatus')}}</label>
          <Dropdown
              id="status"
              v-model="vehicle.status"
              :options="['En Taller', 'Listo', 'Entregado']"
              :placeholder="t('common.selectStatus')"
          />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="brand">{{t('vehicles.labelBrand')}}</label>
          <InputText id="brand" v-model.trim="vehicle.brand" />
        </div>
        <div class="field col">
          <label for="model">{{t('vehicles.labelModel')}}</label>
          <InputText id="model" v-model.trim="vehicle.model" />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="year">{{t('vehicles.labelYear')}}</label>
          <InputText id="year" v-model.trim="vehicle.year" placeholder="Ej: 2024" />
        </div>
        <div class="field col">
          <label for="color">{{t('vehicles.labelColor')}}</label>
          <InputText id="color" v-model.trim="vehicle.color" placeholder="Ej: Rojo" />
        </div>
      </div>

      <template #footer>
        <Button :label="t('common.cancel')" icon="pi pi-times" text @click="hideDialog" />
        <Button :label="t('common.save')" icon="pi pi-check" @click="saveVehicle" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useVehicleStore } from '../application/vehicle.store';
import { useCustomerStore } from '../../customer-management/application/customer.store';
import {useI18n} from 'vue-i18n';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

const {t} = useI18n();
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