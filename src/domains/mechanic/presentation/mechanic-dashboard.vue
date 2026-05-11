<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../auth/application/auth.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const workOrderStore = useWorkOrderStore();

const statusOptions = ['Pendiente', 'En Proceso', 'Completada'];

onMounted(async () => {
  await Promise.all([
    taskStore.fetchAllTasks(),
    workOrderStore.fetchWorkOrders()
  ]);
});

const myTasks = computed(() =>
    taskStore.tasks.filter(task => String(task.mechanicId) === String(authStore.mechanicId))
);

const pendingTasks = computed(() => myTasks.value.filter(t => t.status === 'Pendiente').length);
const progressTasks = computed(() => myTasks.value.filter(t => t.status === 'En Proceso').length);
const completedTasks = computed(() => myTasks.value.filter(t => t.status === 'Completada').length);

const getOrderCode = (workOrderId) => {
  const order = workOrderStore.workOrders.find(o => String(o.id) === String(workOrderId));
  return order?.trackingCode || 'Sin orden';
};

const getSeverity = (status) => {
  if (status === 'Completada') return 'success';
  if (status === 'En Proceso') return 'info';
  return 'warning';
};

const updateStatus = async (task, status) => {
  await taskStore.updateTaskStatus(task.id, status);
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <section class="mechanic-page">
    <div class="mechanic-header">
      <div>
        <span class="eyebrow">Mechanic Workspace</span>
        <h1>Mis tareas asignadas</h1>
        <p>Actualiza el avance de tus tareas para sincronizar el progreso con el panel del administrador.</p>
      </div>

      <Button label="Cerrar sesión" icon="pi pi-sign-out" outlined severity="danger" @click="logout" />
    </div>

    <div class="summary-row">
      <Card class="summary-card"><template #content><span>Pendientes</span><strong>{{ pendingTasks }}</strong></template></Card>
      <Card class="summary-card"><template #content><span>En proceso</span><strong>{{ progressTasks }}</strong></template></Card>
      <Card class="summary-card"><template #content><span>Completadas</span><strong>{{ completedTasks }}</strong></template></Card>
    </div>

    <div class="tasks-grid">
      <Card v-for="task in myTasks" :key="task.id" class="task-card">
        <template #content>
          <div class="task-top">
            <div>
              <Tag :value="getOrderCode(task.workOrderId)" severity="secondary" rounded />
              <h3>{{ task.description }}</h3>
            </div>

            <Tag :value="task.status" :severity="getSeverity(task.status)" rounded />
          </div>

          <div class="field">
            <label>Actualizar estado</label>
            <Dropdown
                :model-value="task.status"
                :options="statusOptions"
                class="w-full"
                @update:model-value="updateStatus(task, $event)"
            />
          </div>

          <Button
              label="Ver orden"
              icon="pi pi-arrow-right"
              icon-pos="right"
              outlined
              class="order-button"
              @click="router.push(`/work-orders/${task.workOrderId}`)"
          />
        </template>
      </Card>
    </div>

    <div v-if="!myTasks.length" class="empty-state">
      <i class="pi pi-check-circle"></i>
      <h3>No tienes tareas asignadas</h3>
      <p>Cuando el administrador te asigne tareas, aparecerán aquí.</p>
    </div>
  </section>
</template>

<style scoped>
.mechanic-page {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
}

.mechanic-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  color: #0b1680;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

h1 {
  margin: .4rem 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 2.7rem);
}

p {
  color: #64748b;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  border-radius: 22px;
}

.summary-card span {
  color: #64748b;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: .25rem;
  color: #0b1680;
  font-size: 2rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.task-card {
  border-radius: 24px;
}

.task-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.task-top h3 {
  margin: .7rem 0 0;
  color: #0f172a;
}

.field label {
  display: block;
  margin-bottom: .5rem;
  color: #64748b;
  font-weight: 700;
}

.order-button {
  width: 100%;
  margin-top: 1rem;
  border-radius: 14px;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 260px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 24px;
  background: #ffffff;
}

.empty-state i {
  color: #0b1680;
  font-size: 2rem;
}

@media (max-width: 768px) {
  .mechanic-header {
    flex-direction: column;
  }

  .summary-row,
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>