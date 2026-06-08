<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../application/task.store';
import { useWorkOrderStore } from '../application/work-order.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';

import Button from 'primevue/button';
import {useI18n} from 'vue-i18n';
import TaskFilters from './components/tasks/TaskFilters.vue';
import TaskCard from './components/tasks/TaskCard.vue';
import TaskDialog from './components/tasks/TaskDialog.vue';

const router = useRouter();
const taskStore = useTaskStore();
const workOrderStore = useWorkOrderStore();
const mechanicStore = useMechanicStore();
const {t} = useI18n();
const displayDialog = ref(false);
const taskForm = ref({});
const search = ref('');
const selectedStatus = ref(null);
const selectedMechanicId = ref(null);

const statusOptions = ['Pendiente', 'En Proceso', 'Completada'];
const priorityOptions = ['Baja', 'Media', 'Alta', 'Crítica'];


onMounted(() => {
  loadAllData();
});

const loadAllData = async () => {
  await Promise.all([
    taskStore.fetchAllTasks(),
    workOrderStore.fetchWorkOrders(),
    mechanicStore.fetchMechanics()
  ]);
};

const getWorkOrderCode = (workOrderId) => {
  if (!workOrderId) return 'N/A';

  const workOrder = workOrderStore.workOrders.find((order) =>
      String(order.id) === String(workOrderId)
  );

  return workOrder ? workOrder.trackingCode : 'Desconocida';
};

const getMechanicName = (mechanicId) => {
  if (!mechanicId) return 'Sin asignar';

  const mechanic = mechanicStore.mechanics.find((item) =>
      String(item.id) === String(mechanicId)
  );

  return mechanic ? mechanic.fullName : 'No encontrado';
};

const getSeverity = (status) => {
  if (status === 'Completada') return 'success';
  if (status === 'En Proceso') return 'info';
  if (status === 'Pendiente') return 'warning';
  return 'secondary';
};

const tasksView = computed(() =>
    taskStore.tasks.map((task) => ({
      id: task.id,
      raw: task,
      description: task.description || 'Tarea sin descripción',
      workOrderId: task.workOrderId,
      workOrderCode: getWorkOrderCode(task.workOrderId),
      mechanicId: task.mechanicId,
      mechanicName: getMechanicName(task.mechanicId),
      status: task.status || 'Pendiente',
      severity: getSeverity(task.status),
      priority: task.priority || 'Media',
      estimatedTime: task.estimatedTime || 2,
      photo: task.photo
    }))
);

const filteredTasks = computed(() => {
  const term = search.value.toLowerCase().trim();

  return tasksView.value.filter((task) => {
    const matchesSearch =
        !term ||
        task.description.toLowerCase().includes(term) ||
        task.workOrderCode.toLowerCase().includes(term) ||
        task.mechanicName.toLowerCase().includes(term);

    const matchesStatus =
        !selectedStatus.value || task.status === selectedStatus.value;

    const matchesMechanic =
        !selectedMechanicId.value || String(task.mechanicId) === String(selectedMechanicId.value);

    return matchesSearch && matchesStatus && matchesMechanic;
  });
});

const pendingTasks = computed(() =>
    taskStore.tasks.filter((task) => task.status === 'Pendiente').length
);

const inProgressTasks = computed(() =>
    taskStore.tasks.filter((task) => task.status === 'En Proceso').length
);

const completedTasks = computed(() =>
    taskStore.tasks.filter((task) => task.status === 'Completada').length
);

const openDialog = () => {
  taskForm.value = {
    description: '',
    workOrderId: null,
    mechanicId: null,
    status: 'Pendiente',
    priority: 'Media',
    estimatedTime: 2
  };

  displayDialog.value = true;
};

const editTask = (task) => {
  taskForm.value = { ...task };
  displayDialog.value = true;
};

const hideDialog = () => {
  displayDialog.value = false;
  taskForm.value = {};
};

const saveTask = async () => {
  if (!taskForm.value.description || !taskForm.value.workOrderId) return;

  if (taskForm.value.id) {
    await taskStore.updateTask(taskForm.value.id, taskForm.value);
  } else {
    await taskStore.addTask(taskForm.value);
  }

  hideDialog();
};

const deleteTask = async (task) => {
  const confirmed = window.confirm(`¿Eliminar la tarea "${task.description}"?`);

  if (!confirmed) return;

  await taskStore.deleteTask(task.id);
};

const onStatusChange = async (task, newStatus) => {
  await taskStore.updateTaskStatus(task.id, newStatus);
};
const onMaterialStatusChange = async (task, newMaterialStatus) => {
  await taskStore.updateMaterialRequestStatus(task.id, newMaterialStatus);
};
const goToWorkOrder = (workOrderId) => {
  if (workOrderId) {
    router.push(`/work-orders/${workOrderId}`);
  }
};
</script>

<template>
  <section class="tasks-page">
    <div class="tasks-header">
      <div>
        <span class="eyebrow">{{ t('tasks.eyebrow') }}</span>
        <h1>{{ t('tasks.title') }}</h1>
        <p>
          {{ t('tasks.description') }}
        </p>
      </div>

      <div class="header-actions">
        <Button
            icon="pi pi-refresh"
            rounded
            outlined
            :loading="taskStore.loading"
            @click="loadAllData"
        />

        <Button
            :label="t('tasks.newButton')"
            icon="pi pi-plus"
            class="add-button"
            @click="openDialog"
        />
      </div>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <span>{{ t('tasks.summary.total') }}</span>
        <strong>{{ taskStore.tasks.length }}</strong>
      </div>

      <div class="summary-card">
        <span>{{ t('tasks.summary.pending') }}</span>
        <strong>{{ pendingTasks }}</strong>
      </div>

      <div class="summary-card">
        <span>{{ t('tasks.summary.inProgress') }}</span>
        <strong>{{ inProgressTasks }}</strong>
      </div>

      <div class="summary-card success">
        <span>{{ t('tasks.summary.completed') }}</span>
        <strong>{{ completedTasks }}</strong>
      </div>
    </div>

    <TaskFilters
        v-model:search="search"
        v-model:status="selectedStatus"
        v-model:mechanicId="selectedMechanicId"
        :status-options="statusOptions"
        :mechanic-options="mechanicStore.mechanics"
    />

    <div v-if="taskStore.loading" class="empty-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>{{t('tasks.loading')}}</p>
    </div>

    <div v-else-if="filteredTasks.length" class="tasks-grid">
      <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :status-options="statusOptions"
          @status-change="onStatusChange"
          @material-status-change="onMaterialStatusChange"
          @edit="editTask"
          @delete="deleteTask"
          @go-order="goToWorkOrder"
      />
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-check-square"></i>
      <h3>{{t('tasks.empty.title')}}</h3>
      <p>{{t('taks.empty.description')}}</p>
    </div>

    <TaskDialog
        v-model:visible="displayDialog"
        :task="taskForm"
        :work-order-options="workOrderStore.workOrders"
        :mechanic-options="mechanicStore.mechanics"
        :status-options="statusOptions"
        :priority-options="priorityOptions"
        @save="saveTask"
        @cancel="hideDialog"
    />
  </section>
</template>

<style scoped>
.tasks-page {
  min-height: 100%;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 0.5rem;
  color: #0b1680;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tasks-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.tasks-header p {
  max-width: 680px;
  margin: 0.75rem 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.add-button {
  background: #0b1680;
  border-color: #0b1680;
  border-radius: 14px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  padding: 1rem 1.2rem;
  border: 1px solid #e8edf5;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.summary-card span {
  display: block;
  color: #64748b;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 0.25rem;
  color: #0b1680;
  font-size: 1.8rem;
}

.summary-card.success strong {
  color: #16a34a;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
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
  margin-bottom: 0.75rem;
}

.empty-state h3 {
  margin: 0;
  color: #0f172a;
}

@media (max-width: 1100px) {
  .summary-row,
  .tasks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .tasks-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .add-button {
    flex: 1;
  }

  .summary-row,
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>