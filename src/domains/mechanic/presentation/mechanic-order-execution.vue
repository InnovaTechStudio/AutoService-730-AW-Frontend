<script setup>
/**
 * Mechanic Order Page
 * Handles task creation, completion and order progress tracking.
 */

import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useAuthStore } from '../../auth/application/auth.store';

// ── CONSTANTS FOR DOMAIN LOGIC ───────────────────────────
/** Estandardized order states for API communication */
const ORDER_STATUS = {
  FINISHED: 'FINISHED'
};

/** Estandardized task states for API communication */
const TASK_STATUS = {
  COMPLETED: 'COMPLETED'
};

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();
const vehicleStore = useVehicleStore();
const authStore = useAuthStore();

const orderId = route.params.id;

const showTaskDialog = ref(false);
const diagnosis = ref('');

/** * Priorities array mapped to structural objects
 * holding code value and dynamic i18n label keys.
 */
const priorities = [
  { value: 'LOW', label: t('priorities.low') },
  { value: 'MEDIUM', label: t('priorities.medium') },
  { value: 'HIGH', label: t('priorities.high') }
];

const newTask = ref({
  description: '',
  priority: 'MEDIUM',
  estimatedTime: 1,
  laborPrice: 0
});

onMounted(async () => {
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    taskStore.fetchAllTasks(),
    vehicleStore.fetchVehicles()
  ]);
});

const order = computed(() =>
    workOrderStore.workOrders.find(
        o => String(o.id) === String(orderId)
    )
);

const vehicle = computed(() =>
    vehicleStore.vehicles.find(
        v => String(v.id) === String(order.value?.vehicleId)
    )
);

const tasks = computed(() =>
    taskStore.tasks.filter(
        t => String(t.workOrderId) === String(orderId)
    )
);

/** Checks if the current work order is locked/closed using system standard */
const isOrderClosed = computed(() =>
    order.value?.status === ORDER_STATUS.FINISHED
);

const totalLabor = computed(() =>
    tasks.value.reduce(
        (sum, task) => sum + Number(task.laborPrice || 0),
        0
    )
);

/** Filters tasks matching the global system completion status */
const completedTasks = computed(() =>
    tasks.value.filter(
        t => t.status === TASK_STATUS.COMPLETED
    ).length
);

const progress = computed(() => {
  if (!tasks.value.length) return 0;

  return Math.round(
      (completedTasks.value / tasks.value.length) * 100
  );
});

const canFinishOrder = computed(() =>
    tasks.value.length > 0 &&
    completedTasks.value === tasks.value.length
);

const updateOrderPrice = async () => {
  const total = tasks.value.reduce(
      (sum, task) => sum + Number(task.laborPrice || 0),
      0
  );

  await workOrderStore.updateOrderAutoPrice(
      order.value.id,
      total
  );
};

const createTask = async () => {
  if (isOrderClosed.value) return;

  await taskStore.addTask({
    workOrderId: Number(orderId),
    mechanicId: authStore.mechanicId,
    description: newTask.value.description,
    priority: newTask.value.priority,
    estimatedTime: newTask.value.estimatedTime,
    laborPrice: newTask.value.laborPrice
  });

  await taskStore.fetchAllTasks();
  await updateOrderPrice();

  showTaskDialog.value = false;

  newTask.value = {
    description: '',
    priority: 'MEDIUM',
    estimatedTime: 1,
    laborPrice: 0
  };
};

const completeTask = async (task) => {
  if (isOrderClosed.value) return;

  await taskStore.updateTask(task.id, {
    ...task,
    status: TASK_STATUS.COMPLETED
  });

  await taskStore.fetchAllTasks();
  await updateOrderPrice();
};

const finishOrder = async () => {
  await workOrderStore.updateWorkOrderChecklist(
      order.value.id,
      {
        ...order.value,
        status: ORDER_STATUS.FINISHED,
        qaChecklist: {
          tasksCompleted: true,
          sparePartsChecked: true,
          diagnosisValidated: true,
          cleaningDone: true,
          finalTestDone: true
        }
      }
  );

  await workOrderStore.fetchWorkOrders();
};

/**
 * Resolves priority value to its translated UI label string
 * @param {string} priorityValue - Raw priority string from standard
 * @returns {string} Mapped i18n label string
 */
const getPriorityLabel = (priorityValue) => {
  const found = priorities.find(p => p.value === priorityValue);
  return found ? found.label : priorityValue;
};
</script>

<template>
  <div class="mechanic-order-page">

    <header class="page-header">
      <Button
          icon="pi pi-arrow-left"
          text
          @click="router.push('/mechanic/workspace')"
      />

      <div>
        <h1>
          {{ $t('mechanicOrder.order') }} {{ order?.trackingCode }}
        </h1>
        <p>
          {{ $t('mechanicOrder.manageDescription') }}
        </p>
      </div>
    </header>

    <Card class="vehicle-card">
      <template #content>
        <div class="vehicle-info">
          <i class="pi pi-car vehicle-icon"></i>

          <div>
            <h2>
              {{ vehicle?.brand }}
              {{ vehicle?.model }}
            </h2>

            <span>
              {{ vehicle?.plate }}
            </span>
          </div>
        </div>
      </template>
    </Card>

    <Card class="diagnosis-card">
      <template #content>
        <h3>{{ $t('mechanicOrder.diagnosis') }}</h3>

        <Textarea
            v-model="diagnosis"
            :disabled="isOrderClosed"
            rows="4"
            class="w-full"
            :placeholder="$t('mechanicOrder.diagnosisPlaceholder')"
        />
      </template>
    </Card>

    <Card class="tasks-card">
      <template #content>

        <div class="section-header">
          <h3>{{ $t('mechanicOrder.tasks') }}</h3>

          <Button
              :label="$t('mechanicOrder.newTask')"
              icon="pi pi-plus"
              :disabled="isOrderClosed"
              @click="showTaskDialog = true"
          />
        </div>

        <div v-if="tasks.length" class="tasks-list">

          <div
              v-for="task in tasks"
              :key="task.id"
              class="task-item"
          >

            <div class="task-content">

              <h4>{{ task.description }}</h4>

              <div class="task-meta">

                <Tag
                    :value="task.status === TASK_STATUS.COMPLETED ? $t('tasks.summary.completed') : task.status"
                    :severity="task.status === TASK_STATUS.COMPLETED ? 'success' : 'warning'"
                />

                <Tag
                    :value="getPriorityLabel(task.priority)"
                    severity="info"
                />

                <span>{{ task.estimatedTime }}h</span>

                <strong>S/ {{ task.laborPrice }}</strong>
              </div>
            </div>

            <Button
                v-if="task.status !== TASK_STATUS.COMPLETED && !isOrderClosed"
                icon="pi pi-check"
                rounded
                severity="success"
                @click="completeTask(task)"
            />
          </div>

        </div>

        <div v-else class="empty-state">
          {{ $t('mechanicOrder.noTasks') }}
        </div>

      </template>
    </Card>

    <Card class="summary-card">
      <template #content>

        <div class="summary-row">
          <span>{{ $t('mechanicOrder.totalLabor') }}</span>
          <strong>S/ {{ totalLabor }}</strong>
        </div>

        <div class="summary-row">
          <span>{{ $t('mechanicOrder.tasksLabel') }}</span>
          <strong>{{ completedTasks }} / {{ tasks.length }}</strong>
        </div>

        <div class="summary-row">
          <span>{{ $t('mechanicOrder.progress') }}</span>
          <strong>{{ progress }}%</strong>
        </div>

        <ProgressBar :value="progress" style="height:12px" />

        <Button
            v-if="canFinishOrder && order?.status !== ORDER_STATUS.FINISHED"
            :label="$t('mechanicOrder.finishOrder')"
            icon="pi pi-check-circle"
            severity="success"
            class="finish-order-btn"
            @click="finishOrder"
        />

      </template>
    </Card>

    <Dialog
        v-model:visible="showTaskDialog"
        modal
        :header="$t('mechanicOrder.dialog.newTask')"
        :style="{ width: '500px' }"
    >

      <div class="dialog-form">

        <InputText
            v-model="newTask.description"
            :placeholder="$t('mechanicOrder.dialog.description')"
        />

        <Dropdown
            v-model="newTask.priority"
            :options="priorities"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('mechanicOrder.dialog.priority')"
        />

        <InputNumber
            v-model="newTask.estimatedTime"
            :placeholder="$t('mechanicOrder.dialog.estimatedTime')"
        />

        <InputNumber
            v-model="newTask.laborPrice"
            :placeholder="$t('mechanicOrder.dialog.laborPrice')"
            mode="currency"
            currency="PEN"
        />

        <Button
            :label="$t('mechanicOrder.dialog.save')"
            icon="pi pi-save"
            @click="createTask"
        />

      </div>

    </Dialog>

  </div>
</template>

<style scoped>
.mechanic-order-page{min-height:100vh;background:#f8fafc;padding:1rem;}
.page-header{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;}
.page-header h1{margin:0;}
.page-header p{margin:0;color:#64748b;}
.vehicle-card,.tasks-card,.summary-card,.diagnosis-card{margin-bottom:1rem;border-radius:20px;}
.vehicle-info{display:flex;gap:1rem;align-items:center;}
.vehicle-icon{font-size:2rem;color:#0b1680;}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;}
.tasks-list{display:flex;flex-direction:column;gap:1rem;}
.task-item{display:flex;justify-content:space-between;align-items:center;background:white;border:1px solid #e2e8f0;border-radius:16px;padding:1rem;}
.task-meta{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem;align-items:center;}
.summary-row{display:flex;justify-content:space-between;margin-bottom:.75rem;}
.empty-state{text-align:center;padding:2rem;color:#64748b;}
.dialog-form{display:flex;flex-direction:column;gap:1rem;}
@media(min-width:900px){.mechanic-order-page{max-width:1000px;margin:auto;}}
.finish-order-btn{margin-top:1rem;width:100%;}
</style>