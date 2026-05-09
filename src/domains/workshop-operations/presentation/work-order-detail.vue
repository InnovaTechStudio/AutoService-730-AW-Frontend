<template>
  <div class="container" v-if="order">
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <Button icon="pi pi-arrow-left" text @click="goBack" class="mr-2" />
        <h1 class="inline-block m-0">Detalle de Orden: {{ order.trackingCode }}</h1>
      </div>
      <Tag :value="order.status" :severity="order.status === 'Finalizado' ? 'success' : 'info'" class="text-xl" />
    </div>

    <div class="card p-4 mb-4 bg-white border-round shadow-1">
      <div class="grid">
        <div class="col-12 md:col-6">
          <p><strong>Descripción:</strong> {{ order.description }}</p>
          <p><strong>Fecha Ingreso:</strong> {{ order.startDate }}</p>
          <p><strong>Fecha Estimada:</strong> {{ order.estimatedDate }}</p>
        </div>
        <div class="col-12 md:col-6 flex flex-column align-items-end justify-content-center">
          <label class="font-bold mb-2">Precio Total (S/.)</label>
          <div class="p-inputgroup" style="width: 200px;">
            <span class="p-inputgroup-addon">S/.</span>
            <InputText v-model.number="localPrice" type="number" @blur="savePrice" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-content-between align-items-center mb-3 mt-5">
      <h2>Tareas Asignadas</h2>
      <Button label="Agregar Tarea" icon="pi pi-plus" @click="openTaskDialog" severity="secondary" />
    </div>

    <DataTable :value="taskStore.tasks" :loading="taskStore.loading" dataKey="id" responsiveLayout="scroll" class="bg-white">
      <Column field="description" header="Descripción de la Tarea"></Column>
      <Column header="Mecánico">
        <template #body="slotProps">
          {{ getMechanicName(slotProps.data.mechanicId) }}
        </template>
      </Column>
      <Column field="status" header="Estado">
        <template #body="slotProps">
          <Dropdown
              v-model="slotProps.data.status"
              :options="['Pendiente', 'En Proceso', 'Completada']"
              @change="updateTaskStatus(slotProps.data)"
              class="w-full"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="taskDialog" header="Nueva Tarea" :modal="true" class="p-fluid">
      <div class="field">
        <label>Descripción</label>
        <InputText v-model.trim="newTask.description" required autofocus />
      </div>
      <div class="field">
        <label>Asignar a Mecánico</label>
        <Dropdown
            v-model="newTask.mechanicId"
            :options="mechanicStore.mechanics"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Selecciona un mecánico"
        />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="taskDialog = false" />
        <Button label="Guardar" icon="pi pi-check" @click="saveTask" />
      </template>
    </Dialog>
  </div>
  <div v-else class="flex justify-content-center mt-5">
    <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkOrderStore } from '../application/work-order.store';
import { useTaskStore } from '../application/task.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

const route = useRoute();
const router = useRouter();
const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();
const mechanicStore = useMechanicStore();

const orderId = route.params.id;


const order = computed(() => {
  return workOrderStore.workOrders.find(wo => String(wo.id) === String(orderId));
});

const localPrice = ref(0);
const taskDialog = ref(false);
const newTask = ref({});

onMounted(async () => {

  const promises = [
    taskStore.fetchTasksByOrder(orderId),
    mechanicStore.fetchMechanics()
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