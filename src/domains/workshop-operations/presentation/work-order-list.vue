<template>
  <div class="container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>Órdenes de Trabajo Activas</h1>
      <Button label="Nueva Orden" icon="pi pi-plus" @click="router.push('/work-orders/new')" />
    </div>

    <DataTable :value="workOrderStore.workOrders" :loading="workOrderStore.loading" responsiveLayout="scroll">
      <Column field="trackingCode" header="Código"></Column>
      <Column header="Vehículo (Placa)">
        <template #body="slotProps">
          {{ getVehiclePlate(slotProps.data.vehicleId) }}
        </template>
      </Column>
      <Column header="Cliente">
        <template #body="slotProps">
          {{ getCustomerName(slotProps.data.customerId) }}
        </template>
      </Column>
      <Column header="Progreso">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <ProgressBar :value="calculateProgress(slotProps.data.id)" :showValue="false" style="width: 100px; height: 8px" />
            <span>{{ calculateProgress(slotProps.data.id) }}%</span>
          </div>
        </template>
      </Column>
      <Column field="startDate" header="Ingreso"></Column>
      <Column field="estimatedDate" header="Entrega Est."></Column>
      <Column field="status" header="Estado">
        <template #body="slotProps">
          <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'Finalizado' ? 'success' : 'info'" />
        </template>
      </Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button icon="pi pi-search" text rounded @click="viewDetail(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWorkOrderStore } from '../application/work-order.store';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useCustomerStore } from '../../customer-management/application/customer.store';
import { useTaskStore } from '../application/task.store';
import { useRouter } from 'vue-router';


import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';

const workOrderStore = useWorkOrderStore();
const vehicleStore = useVehicleStore();
const customerStore = useCustomerStore();
const taskStore = useTaskStore();
const router = useRouter();

onMounted(async () => {

  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    vehicleStore.fetchVehicles(),
    customerStore.fetchCustomers()
  ]);
});

const getVehiclePlate = (id) => vehicleStore.vehicles.find(v => String(v.id) === String(id))?.plate || '---';

const getCustomerName = (id) => {
  if (!id) return '---';
  const customer = customerStore.customers.find(c => String(c.id) === String(id));
  return customer ? customer.fullName : 'Cliente no encontrado';
};

const calculateProgress = (orderId) => {

  return 0;
};

const viewDetail = (order) => {
  router.push(`/work-orders/${order.id}`);
};
</script>