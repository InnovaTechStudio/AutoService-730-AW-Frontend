<template>
  <div class="order-page" v-if="order">

    <!-- HEADER -->
    <div class="order-header">
      <div class="flex align-items-center gap-3">
        <Button
            icon="pi pi-arrow-left"
            rounded
            outlined
            severity="secondary"
            @click="goBack"
        />

        <div>
          <h1 class="title">
            Orden #{{ order.trackingCode }}
          </h1>

          <p class="subtitle">
            Gestión completa de la orden de trabajo
          </p>
        </div>
      </div>

      <Tag
          :value="order.status"
          :severity="order.status === 'Finalizado' ? 'success' : 'warning'"
          class="status-tag"
      />
    </div>

    <!-- CARD PRINCIPAL -->
    <Card class="main-card">

      <template #content>

        <div class="grid">

          <!-- INFORMACIÓN -->
          <div class="col-12 md:col-7">

            <div class="info-block">
              <i class="pi pi-file-edit info-icon"></i>

              <div>
                <h3>Descripción</h3>
                <p>{{ order.description }}</p>
              </div>
            </div>

            <Divider />

            <div class="dates-container">

              <div class="date-card">
                <i class="pi pi-calendar"></i>

                <div>
                  <span>Ingreso</span>
                  <strong>{{ order.startDate }}</strong>
                </div>
              </div>

              <div class="date-card">
                <i class="pi pi-clock"></i>

                <div>
                  <span>Entrega</span>
                  <strong>{{ order.estimatedDate }}</strong>
                </div>
              </div>

            </div>

            <!-- VEHÍCULO -->
            <div v-if="vehicle" class="vehicle-card">

              <img
                  :src="vehicle.image"
                  :alt="vehicle.brand"
                  class="vehicle-image"
              />

              <div class="vehicle-info">
                <h2>
                  {{ vehicle.brand }} {{ vehicle.model }}
                </h2>

                <Chip
                    :label="vehicle.plate"
                    icon="pi pi-car"
                    class="plate-chip"
                />
              </div>

            </div>

          </div>

          <!-- PRECIO -->
          <div class="col-12 md:col-5">

            <div class="price-card">

              <h3>Total de la Orden</h3>

              <div class="price-input-container">

                <span class="currency">S/.</span>

                <InputText
                    v-model.number="localPrice"
                    type="number"
                    class="price-input"
                    @blur="savePrice"
                />

              </div>

              <small>
                Actualiza el monto total de la reparación
              </small>

            </div>

          </div>

        </div>

      </template>

    </Card>

    <!-- TAREAS -->
    <div class="tasks-header">

      <div>
        <h2>Tareas Asignadas</h2>
        <p>Gestiona el progreso del trabajo</p>
      </div>

      <Button
          label="Nueva Tarea"
          icon="pi pi-plus"
          severity="contrast"
          @click="openTaskDialog"
      />

    </div>

    <!-- TABLA -->
    <Card class="table-card">

      <template #content>

        <DataTable
            :value="taskStore.tasks"
            :loading="taskStore.loading"
            responsiveLayout="scroll"
            stripedRows
            showGridlines
            class="custom-table"
        >

          <Column field="description" header="Tarea"></Column>

          <Column header="Mecánico">
            <template #body="slotProps">

              <div class="mechanic-cell">

                <Avatar
                    icon="pi pi-user"
                    shape="circle"
                />

                <span>
                  {{ getMechanicName(slotProps.data.mechanicId) }}
                </span>

              </div>

            </template>
          </Column>

          <Column field="status" header="Estado">

            <template #body="slotProps">

              <Dropdown
                  v-model="slotProps.data.status"
                  :options="['Pendiente', 'En Proceso', 'Completada']"
                  @change="updateTaskStatus(slotProps.data)"
                  class="status-dropdown"
              />

            </template>

          </Column>

        </DataTable>

      </template>

    </Card>

    <!-- DIALOG -->
    <Dialog
        v-model:visible="taskDialog"
        header="Nueva Tarea"
        :modal="true"
        :style="{ width: '30rem' }"
        class="task-dialog"
    >

      <div class="field">
        <label>Descripción</label>

        <InputText
            v-model.trim="newTask.description"
            placeholder="Describe la tarea"
        />
      </div>

      <div class="field mt-4">
        <label>Mecánico</label>

        <Dropdown
            v-model="newTask.mechanicId"
            :options="mechanicStore.mechanics"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Selecciona un mecánico"
        />
      </div>

      <template #footer>

        <Button
            label="Cancelar"
            text
            severity="secondary"
            @click="taskDialog = false"
        />

        <Button
            label="Guardar"
            icon="pi pi-check"
            @click="saveTask"
        />

      </template>

    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkOrderStore } from '../application/work-order.store';
import { useTaskStore } from '../application/task.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
const route = useRoute();
const router = useRouter();
const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();
const mechanicStore = useMechanicStore();
const vehicleStore = useVehicleStore();

const orderId = route.params.id;


const order = computed(() => {
  return workOrderStore.workOrders.find(wo => String(wo.id) === String(orderId));
});

const vehicle = computed(() => {
  if (!order.value) return null;

  return vehicleStore.vehicles.find(
      v => String(v.id) === String(order.value.vehicleId)
  );
});

const localPrice = ref(0);
const taskDialog = ref(false);
const newTask = ref({});

onMounted(async () => {

  const promises = [
    taskStore.fetchTasksByOrder(orderId),
    mechanicStore.fetchMechanics(),
    vehicleStore.fetchVehicles()
  ];

  if (workOrderStore.workOrders.length === 0) {
    promises.push(workOrderStore.fetchWorkOrders());
  }

  await Promise.all(promises);


  if (order.value) {
    localPrice.value = order.value.price || 0;
  }
});


watch(order, (newVal) => {
  if (newVal) localPrice.value = newVal.price || 0;
});

const getMechanicName = (id) => {
  if (!id) return 'Sin asignar';
  const mechanic = mechanicStore.mechanics.find(m => String(m.id) === String(id));
  return mechanic ? mechanic.fullName : 'Mecánico no encontrado';
};

const goBack = () => router.push('/work-orders');

const savePrice = async () => {
  if (order.value && order.value.id) {

    const updatedData = { ...order.value, price: parseFloat(localPrice.value) };
    await workOrderStore.updateWorkOrder(order.value.id, updatedData);
  }
};

const openTaskDialog = () => {
  newTask.value = { workOrderId: orderId, description: '', status: 'Pendiente', mechanicId: null };
  taskDialog.value = true;
};

const saveTask = async () => {
  if (newTask.value.description) {
    await taskStore.addTask(newTask.value);
    taskDialog.value = false;
  }
};

const updateTaskStatus = async (task) => {
  await taskStore.updateTaskStatus(task.id, task.status);
};
</script>
<style scoped>

/* HEADER */

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.subtitle {
  margin-top: 0.3rem;
  color: #64748b;
}

.status-tag {
  font-size: 1rem;
  padding: 0.7rem 1.2rem;
}

/* CARD */

.main-card,
.table-card {
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  border: none;
}

/* INFO */

.info-block {
  display: flex;
  gap: 1rem;
  align-items: start;
}

.info-icon {
  font-size: 1.5rem;
  color: #3b82f6;
  margin-top: 0.3rem;
}

.info-block h3 {
  margin-bottom: 0.5rem;
  color: #0f172a;
}

.info-block p {
  color: #475569;
  line-height: 1.6;
}

/* FECHAS */

.dates-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.date-card {
  flex: 1;
  min-width: 180px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  padding: 1rem;
  border-radius: 18px;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-card i {
  font-size: 1.5rem;
  color: #2563eb;
}

.date-card span {
  display: block;
  color: #64748b;
  font-size: 0.9rem;
}

/* VEHÍCULO */

.vehicle-card {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  border-radius: 24px;
  padding: 1rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
}

.vehicle-image {
  width: 180px;
  height: 120px;
  object-fit: cover;
  border-radius: 18px;
}

.vehicle-info h2 {
  margin: 0 0 1rem;
  color: #0f172a;
}

.plate-chip {
  background: #dbeafe;
  color: #1d4ed8;
}

/* PRECIO */

.price-card {
  height: 100%;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: white;
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.price-card h3 {
  margin-bottom: 2rem;
  font-size: 1.4rem;
}

.price-input-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.currency {
  padding: 1rem;
  color: #1e3a8a;
  font-weight: bold;
}

.price-input {
  border: none !important;
  box-shadow: none !important;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e3a8a;
}

.price-card small {
  margin-top: 1rem;
  opacity: 0.8;
}

/* TASKS */

.tasks-header {
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-header h2 {
  margin: 0;
}

.tasks-header p {
  margin-top: 0.3rem;
  color: #64748b;
}

/* TABLA */

.custom-table {
  border-radius: 20px;
  overflow: hidden;
}

.mechanic-cell {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.status-dropdown {
  width: 100%;
}

/* DIALOG */

.task-dialog ::v-deep(.p-dialog-content) {
  padding-top: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
}

/* RESPONSIVE */

@media screen and (max-width: 768px) {

  .order-header {
    flex-direction: column;
    align-items: start;
    gap: 1rem;
  }

  .vehicle-card {
    flex-direction: column;
    text-align: center;
  }

  .vehicle-image {
    width: 100%;
    height: 200px;
  }

  .tasks-header {
    flex-direction: column;
    align-items: start;
    gap: 1rem;
  }

}

</style>

