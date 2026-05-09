<template>
  <div class="container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>Panel de Staff (Mecánicos)</h1>
      <Button label="Registrar Mecánico" icon="pi pi-user-plus" @click="openDialog" />
    </div>

    <div class="grid">
      <div class="col-12 md:col-4" v-for="mechanic in mechanicStore.mechanics" :key="mechanic.id">
        <div class="card p-4 bg-white border-round shadow-1 relative overflow-hidden">
          <div :class="['load-indicator', getLoadClass(mechanic.id, mechanic.maxCapacity)]"></div>

          <div class="flex align-items-center mb-3">
            <Avatar icon="pi pi-user" size="large" shape="circle" class="mr-3" />
            <div>
              <h3 class="m-0">{{ mechanic.fullName }}</h3>
              <small class="text-500">{{ mechanic.specialty }}</small>
            </div>
          </div>

          <div class="mb-3">
            <div class="flex justify-content-between mb-1">
              <span>Carga Laboral</span>
              <span class="font-bold">{{ getActiveTasksCount(mechanic.id) }} / {{ mechanic.maxCapacity }}</span>
            </div>
            <ProgressBar
                :value="calculateLoadPercentage(mechanic.id, mechanic.maxCapacity)"
                :showValue="false"
                :color="getProgressBarColor(mechanic.id, mechanic.maxCapacity)"
                style="height: 10px"
            />
          </div>

          <div class="flex justify-content-between align-items-center mt-4">
            <Tag :value="getWorkloadStatus(mechanic.id, mechanic.maxCapacity)" :severity="getSeverity(mechanic.id, mechanic.maxCapacity)" />
            <Button icon="pi pi-eye" text rounded @click="viewTasks(mechanic)" />
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="displayDialog" header="Nuevo Integrante del Staff" :modal="true" class="p-fluid" style="width: 400px">
      <div class="field">
        <label>Nombre Completo</label>
        <InputText v-model="newMechanic.fullName" required />
      </div>
      <div class="field">
        <label>Especialidad</label>
        <Dropdown
            v-model="newMechanic.specialty"
            :options="['Mecánica General', 'Electricidad', 'Planchado y Pintura', 'Electrónica']"
            placeholder="Seleccionar especialidad"
        />
      </div>
      <div class="field">
        <label>Capacidad Máxima de Tareas</label>
        <InputNumber v-model="newMechanic.maxCapacity" showButtons :min="1" :max="10" />
      </div>
      <template #footer>
        <Button label="Guardar" icon="pi pi-check" @click="saveMechanic" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMechanicStore } from '../application/mechanic.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';

const mechanicStore = useMechanicStore();
const taskStore = useTaskStore();

const displayDialog = ref(false);
const newMechanic = ref({ fullName: '', specialty: '', maxCapacity: 5 });

onMounted(async () => {
  await Promise.all([
    mechanicStore.fetchMechanics(),
    taskStore.fetchAllTasks()
  ]);
});


const getActiveTasksCount = (mechanicId) => {
  return taskStore.tasks.filter(t =>
      String(t.mechanicId) === String(mechanicId) && t.status !== 'Completada'
  ).length;
};

const calculateLoadPercentage = (id, max) => {
  const count = getActiveTasksCount(id);
  return Math.min((count / max) * 100, 100);
};

const getWorkloadStatus = (id, max) => {
  const count = getActiveTasksCount(id);
  if (count >= max) return 'Al Máximo';
  if (count >= max * 0.7) return 'Carga Alta';
  return 'Disponible';
};

const getSeverity = (id, max) => {
  const count = getActiveTasksCount(id);
  if (count >= max) return 'danger';
  if (count >= max * 0.7) return 'warning';
  return 'success';
};

const getProgressBarColor = (id, max) => {
  const count = getActiveTasksCount(id);
  if (count >= max) return '#ef4444';
  if (count >= max * 0.7) return '#f59e0b';
  return '#10b981';
};

const getLoadClass = (id, max) => {
  const count = getActiveTasksCount(id);
  if (count >= max) return 'bg-red-500';
  if (count >= max * 0.7) return 'bg-orange-500';
  return 'bg-green-500';
};


const openDialog = () => {
  newMechanic.value = { fullName: '', specialty: 'Mecánica General', maxCapacity: 5 };
  displayDialog.value = true;
};

const saveMechanic = async () => {
  if (newMechanic.value.fullName) {
    await mechanicStore.addMechanic(newMechanic.value);
    displayDialog.value = false;
  }
};
</script>

<style scoped>
.load-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 4px;
}
</style>