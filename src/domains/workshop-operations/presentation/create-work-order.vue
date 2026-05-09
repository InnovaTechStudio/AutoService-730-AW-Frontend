<template>
  <div class="container">
    <div class="flex align-items-center mb-4">
      <Button icon="pi pi-arrow-left" text @click="goBack" class="mr-3" />
      <h1 class="m-0">Registrar Nueva Orden de Trabajo</h1>
    </div>

    <div class="grid">
      <div class="col-12 md:col-5">
        <div class="card p-4 bg-white border-round shadow-1 h-full">
          <h3>Datos Generales</h3>

          <div class="field mb-3">
            <label>Vehículo</label>
            <Dropdown
                v-model="newWO.vehicleId"
                :options="vehicleStore.vehicles"
                optionLabel="plate"
                optionValue="id"
                placeholder="Seleccionar Placa"
                filter class="w-full"
                @change="onVehicleChange"
            />
          </div>

          <div class="field mb-3" v-if="selectedCustomerName">
            <label>Cliente Dueño</label>
            <InputText :value="selectedCustomerName" disabled class="w-full" />
          </div>

          <div class="field mb-3">
            <label>Descripción del Problema</label>
            <Textarea v-model="newWO.description" rows="3" class="w-full" />
          </div>

          <div class="formgrid grid">
            <div class="field col">
              <label>Fecha Estimada</label>
              <Calendar v-model="newWO.estimatedDate" dateFormat="yy-mm-dd" showIcon class="w-full" />
            </div>
            <div class="field col">
              <label>Precio Total (S/.)</label>
              <InputText v-model.number="newWO.price" type="number" class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-7">
        <div class="card p-4 bg-white border-round shadow-1 h-full">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3>Tareas Asignadas</h3>
            <Button label="Añadir Tarea" icon="pi pi-plus" size="small" @click="addTaskRow" severity="secondary" />
          </div>

          <DataTable :value="tasks" responsiveLayout="scroll" class="p-datatable-sm">
            <Column header="Descripción">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.description" placeholder="Ej: Cambio de aceite" class="w-full" />
              </template>
            </Column>
            <Column header="Mecánico Asignado">
              <template #body="slotProps">
                <Dropdown
                    v-model="slotProps.data.mechanicId"
                    :options="mechanicStore.mechanics"
                    optionLabel="fullName"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="w-full"
                />
              </template>
            </Column>
            <Column header="">
              <template #body="slotProps">
                <Button icon="pi pi-trash" severity="danger" text rounded @click="removeTaskRow(slotProps.index)" />
              </template>
            </Column>
          </DataTable>

          <div v-if="tasks.length === 0" class="text-center p-3 text-500">
            No has agregado tareas. Añade al menos una.
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-content-end mt-4">
      <Button label="Cancelar" icon="pi pi-times" text severity="secondary" class="mr-2" @click="goBack" />
      <Button label="Guardar Orden Completa" icon="pi pi-save" @click="saveFullWorkOrder" :loading="isSaving" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkOrderStore } from '../application/work-order.store';
import { useTaskStore } from '../application/task.store';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useCustomerStore } from '../../customer-management/application/customer.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const router = useRouter();
const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();
const vehicleStore = useVehicleStore();
const customerStore = useCustomerStore();
const mechanicStore = useMechanicStore();

const isSaving = ref(false);
const selectedCustomerName = ref('');
const newWO = ref({ vehicleId: null, customerId: null, description: '', estimatedDate: null, price: 0 });
const tasks = ref([]);

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchVehicles(),
    customerStore.fetchCustomers(),
    mechanicStore.fetchMechanics()
  ]);
});

const goBack = () => router.push('/work-orders');

const onVehicleChange = () => {
  const vehicle = vehicleStore.vehicles.find(v => String(v.id) === String(newWO.value.vehicleId));
  if (vehicle) {
    newWO.value.customerId = vehicle.customerId;
    const customer = customerStore.customers.find(c => String(c.id) === String(vehicle.customerId));
    selectedCustomerName.value = customer ? customer.fullName : 'No encontrado';
  }
};

const addTaskRow = () => {
  tasks.value.push({ description: '', mechanicId: null, status: 'Pendiente' });
};

const removeTaskRow = (index) => {
  tasks.value.splice(index, 1);
};

const saveFullWorkOrder = async () => {
  if (!newWO.value.vehicleId || tasks.value.length === 0) {
    alert("Debes seleccionar un vehículo y añadir al menos una tarea.");
    return;
  }

  isSaving.value = true;
  try {

    const formattedDate = newWO.value.estimatedDate instanceof Date
        ? newWO.value.estimatedDate.toISOString().split('T')[0]
        : newWO.value.estimatedDate;

    const payloadWO = { ...newWO.value, estimatedDate: formattedDate, status: 'En Proceso' };


    const createdOrder = await workOrderStore.addWorkOrder(payloadWO);


    for (let task of tasks.value) {
      if (task.description) {
        await taskStore.addTask({
          ...task,
          workOrderId: createdOrder.id
        });
      }
    }


    router.push('/work-orders');
  } catch (error) {
    console.error("Error al guardar la orden completa:", error);
  } finally {
    isSaving.value = false;
  }
};
</script>