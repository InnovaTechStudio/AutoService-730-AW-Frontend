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
            <div v-if="selectedVehicle" class="vehicle-preview-card">
              <img
                  :src="selectedVehicle.image"
                  :alt="selectedVehicle.brand"
                  class="vehicle-preview-image"
              />

              <div class="vehicle-preview-info">
                <h4>
                  {{ selectedVehicle.brand }}
                  {{ selectedVehicle.model }}
                </h4>

                <p>{{ selectedVehicle.plate }}</p>
              </div>
            </div>
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
const selectedVehicle = ref(null);
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
  const vehicle = vehicleStore.vehicles.find(
      v => String(v.id) === String(newWO.value.vehicleId)
  );

  selectedVehicle.value = vehicle || null;

  if (vehicle) {
    newWO.value.customerId = vehicle.customerId;

    const customer = customerStore.customers.find(
        c => String(c.id) === String(vehicle.customerId)
    );

    selectedCustomerName.value = customer
        ? customer.fullName
        : 'No encontrado';
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

<style scoped>

/* CONTENEDOR GENERAL */
.container {
  padding: 2rem;
  background: #f1f5f9;
  min-height: 100vh;
}

/* TITULOS */
h1 {
  color: #0f172a;
  font-size: 2rem;
  font-weight: 700;
}

h3 {
  margin-bottom: 1.5rem;
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.7rem;
}

/* TARJETAS */
.card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow:
      0 4px 10px rgba(15, 23, 42, 0.04),
      0 2px 4px rgba(15, 23, 42, 0.02);
  transition: all 0.25s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.08),
      0 4px 10px rgba(15, 23, 42, 0.05);
}

/* CAMPOS */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

/* INPUTS */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputtextarea) {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:not(.p-disabled).p-focus),
:deep(.p-inputtextarea:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
}

/* PREVIEW VEHICULO */
.vehicle-preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 18px;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  border: 1px solid #dbeafe;
}

.vehicle-preview-image {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.vehicle-preview-info h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.vehicle-preview-info p {
  margin-top: 0.4rem;
  color: #64748b;
  font-size: 0.9rem;
}

/* TABLA */
:deep(.p-datatable) {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #334155;
  font-weight: 700;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

/* BOTONES */
:deep(.p-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.p-button:hover) {
  transform: translateY(-1px);
}

/* BOTON PRINCIPAL */
:deep(.p-button:not(.p-button-text)) {
  box-shadow: 0 4px 10px rgba(59,130,246,0.15);
}

/* MENSAJE VACIO */
.text-500 {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 1.5rem;
  margin-top: 1rem;
}

/* SEPARACION INFERIOR */
.mb-3 {
  margin-bottom: 1.5rem !important;
}

.mb-4 {
  margin-bottom: 2rem !important;
}

.mt-4 {
  margin-top: 2rem !important;
}

/* FOOTER BOTONES */
.flex.justify-content-end {
  padding-top: 1rem;
  border-top: 1px solid #cbd5e1;
}

/* RESPONSIVE */
@media screen and (max-width: 768px) {

  .container {
    padding: 1rem;
  }

  .card {
    padding: 1.2rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .vehicle-preview-card {
    flex-direction: column;
    text-align: center;
  }

  .vehicle-preview-image {
    width: 100%;
    height: 180px;
  }
}

</style>