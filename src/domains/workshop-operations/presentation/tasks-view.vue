<script setup>
/**
 * Tasks management view.
 * Handles task listing, filtering, editing and audit review workflow.
 */

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

import { useTaskStore } from '../application/task.store';
import { useWorkOrderStore } from '../application/work-order.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';

import TaskCard from './components/tasks/TaskCard.vue';
import TaskDialog from './components/tasks/TaskDialog.vue';
import TaskFilters from './components/tasks/TaskFilters.vue';

// ── CONSTANTS FOR DOMAIN LOGIC ───────────────────────────
/** Standardized system task states */
const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

const router = useRouter();

const taskStore = useTaskStore();
const workOrderStore = useWorkOrderStore();
const mechanicStore = useMechanicStore();

const { t } = useI18n();

// ── Dialog state ──────────────────────────────────────────
const displayDialog = ref(false);
const reviewDialog = ref(false);

// ── Forms ─────────────────────────────────────────────────
const taskForm = ref({});
const taskToReview = ref(null);

// ── Filters ───────────────────────────────────────────────
const search = ref('');
const selectedStatus = ref(null);
const selectedMechanicId = ref(null);

// ── Options Mapped with Core Domain Values ────────────────
const statusOptions = computed(() => [
  { value: TASK_STATUS.PENDING, label: t('taskStatus.pending') },
  { value: TASK_STATUS.IN_PROGRESS, label: t('taskStatus.in_progress') },
  { value: TASK_STATUS.COMPLETED, label: t('taskStatus.completed') }
]);

const priorityOptions = computed(() => [
  { value: 'LOW', label: t('priorities.low') },
  { value: 'MEDIUM', label: t('priorities.medium') },
  { value: 'HIGH', label: t('priorities.high') },
  { value: 'CRITICAL', label: t('priorities.critical') }
]);

/**
 * Loads all required data for the page.
 * @returns {Promise<void>}
 */
const loadAllData = async () => {
  await Promise.all([
    taskStore.fetchAllTasks(),
    workOrderStore.fetchWorkOrders(),
    mechanicStore.fetchMechanics()
  ]);
};

onMounted(() => loadAllData());

/**
 * Returns work order tracking code.
 * @param {string|number} workOrderId
 * @returns {string}
 */
const getWorkOrderCode = (workOrderId) => {
  if (!workOrderId) return t('tasks.fallbacks.notAvailable');

  const workOrder = workOrderStore.workOrders.find(
      order => String(order.id) === String(workOrderId)
  );

  return workOrder
      ? workOrder.trackingCode
      : t('tasks.fallbacks.unknown');
};

/**
 * Returns mechanic display name.
 * @param {string|number} mechanicId
 * @returns {string}
 */
const getMechanicName = (mechanicId) => {
  if (!mechanicId) return t('tasks.fallbacks.unassigned');

  const mechanic = mechanicStore.mechanics.find(
      item => String(item.id) === String(mechanicId)
  );

  return mechanic
      ? mechanic.fullName
      : t('tasks.fallbacks.notFound');
};

/**
 * Maps task status to PrimeVue severity contexts.
 * @param {string} status - Domain status string
 * @returns {string} Severity string
 */
const getSeverity = (status) => {
  if (status === TASK_STATUS.COMPLETED) return 'success';
  if (status === TASK_STATUS.IN_PROGRESS) return 'info';
  if (status === TASK_STATUS.PENDING) return 'warning';

  return 'secondary';
};

/**
 * Resolves priority value code to its dynamic translation key
 * @param {string} priority - Raw priority standard code
 * @returns {string} Translated interface string
 */
const getPriorityLabel = (priority) => {
  const key = String(priority).toLowerCase();
  return t(`priorities.${key}`);
};

// ── Computed ──────────────────────────────────────────────
const tasksView = computed(() =>
    taskStore.tasks.map(task => ({
      id: task.id,
      raw: task,
      description: task.description || t('tasks.fallbacks.noDescription'),
      workOrderId: task.workOrderId,
      workOrderCode: getWorkOrderCode(task.workOrderId),
      mechanicId: task.mechanicId,
      mechanicName: getMechanicName(task.mechanicId),
      status: task.status || TASK_STATUS.PENDING,
      severity: getSeverity(task.status),
      priority: task.priority || 'MEDIUM',
      estimatedTime: task.estimatedTime || 2,
      photo: task.photo
    }))
);

const filteredTasks = computed(() => {
  const term = search.value.toLowerCase().trim();

  return tasksView.value.filter(task => {
    const matchesSearch =
        !term ||
        task.description.toLowerCase().includes(term) ||
        task.workOrderCode.toLowerCase().includes(term) ||
        task.mechanicName.toLowerCase().includes(term);

    const matchesStatus =
        !selectedStatus.value ||
        task.status === selectedStatus.value;

    const matchesMechanic =
        !selectedMechanicId.value ||
        String(task.mechanicId) === String(selectedMechanicId.value);

    return matchesSearch && matchesStatus && matchesMechanic;
  });
});

const pendingTasks = computed(() =>
    taskStore.tasks.filter(task => task.status === TASK_STATUS.PENDING).length
);

const inProgressTasks = computed(() =>
    taskStore.tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length
);

const completedTasks = computed(() =>
    taskStore.tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length
);

// ── Actions ───────────────────────────────────────────────

/**
 * Opens task edit dialog.
 * @param {Object} task
 */
const editTask = (task) => {
  taskForm.value = JSON.parse(JSON.stringify(task));

  if (!taskForm.value.parts) {
    taskForm.value.parts = [];
  }

  displayDialog.value = true;
};

/**
 * Resets and closes edit dialog.
 */
const hideDialog = () => {
  displayDialog.value = false;
  taskForm.value = {};
};

/**
 * Persists task changes.
 * @returns {Promise<void>}
 */
const saveTask = async () => {
  if (!taskForm.value.description || !taskForm.value.workOrderId) {
    return;
  }

  await taskStore.updateTask(taskForm.value.id, taskForm.value);

  hideDialog();
};

/**
 * Deletes a task after confirmation.
 * @param {Object} task
 * @returns {Promise<void>}
 */
const deleteTask = async (task) => {
  const confirmed = window.confirm(
      t('tasks.messages.deleteConfirmation', {
        description: task.description
      })
  );

  if (!confirmed) {
    return;
  }

  await taskStore.deleteTask(task.id);
};

/**
 * Navigates to work order detail page.
 * @param {string|number} workOrderId
 */
const goToWorkOrder = (workOrderId) => {
  if (workOrderId) {
    router.push(`/work-orders/${workOrderId}`);
  }
};

// ── Review workflow ───────────────────────────────────────

/**
 * Opens task review dialog.
 * @param {Object} rawTask
 */
const openReview = (rawTask) => {
  taskToReview.value = { ...rawTask };
  reviewDialog.value = true;
};

/**
 * Approves reviewed task.
 * @returns {Promise<void>}
 */
const approveTask = async () => {
  await taskStore.approveTask(taskToReview.value.id);

  reviewDialog.value = false;
  taskToReview.value = null;
};

/**
 * Rejects reviewed task.
 * @returns {Promise<void>}
 */
const rejectTask = async () => {
  await taskStore.rejectTask(taskToReview.value.id);

  reviewDialog.value = false;
  taskToReview.value = null;
};
</script>

<template>
  <section class="tasks-page">

    <div class="tasks-header">
      <div>
        <span class="eyebrow">{{ t('tasks.eyebrow') }}</span>

        <h1>{{ t('tasks.title') }}</h1>

        <p>{{ t('tasks.description') }}</p>
      </div>

      <Button
          icon="pi pi-refresh"
          rounded
          outlined
          :loading="taskStore.loading"
          @click="loadAllData"
      />
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
      <p>{{ t('tasks.loading') }}</p>
    </div>

    <div v-else-if="filteredTasks.length" class="tasks-grid">
      <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @review="openReview"
          @edit="editTask"
          @delete="deleteTask"
          @go-order="goToWorkOrder"
      />
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-check-square"></i>

      <h3>{{ t('tasks.empty.title') }}</h3>

      <p>{{ t('tasks.empty.description') }}</p>
    </div>

    <TaskDialog
        v-model:visible="displayDialog"
        :task="taskForm"
        :work-order-options="workOrderStore.workOrders"
        :mechanic-options="mechanicStore.mechanics"
        @save="saveTask"
        @cancel="hideDialog"
    />

    <Dialog
        v-model:visible="reviewDialog"
        :header="t('tasks.review.dialogTitle')"
        :modal="true"
        :style="{ width: '500px' }"
    >
      <div v-if="taskToReview" class="review-body">

        <div class="review-field">
          <label>{{ t('tasks.review.technicalDiagnosis') }}</label>

          <p>
            {{
              taskToReview.technicalDiagnosis ||
              t('tasks.review.notRegistered')
            }}
          </p>
        </div>

        <div class="review-field">
          <label>{{ t('tasks.review.customerExplanation') }}</label>

          <p>
            {{
              taskToReview.customerExplanation ||
              t('tasks.review.notRegistered')
            }}
          </p>
        </div>

        <div class="review-field">
          <label>{{ t('tasks.review.internalObservation') }}</label>

          <p>
            {{
              taskToReview.internalObservation ||
              t('tasks.review.notRegistered')
            }}
          </p>
        </div>

        <div
            v-if="taskToReview.evidenceRegistered"
            class="review-field"
        >
          <label>{{ t('tasks.review.evidence') }}</label>

          <p class="evidence-link">
            {{ taskToReview.evidenceRegistered }}
          </p>
        </div>

        <div
            v-if="taskToReview.parts && taskToReview.parts.length > 0"
            class="review-field"
        >
          <label>
            <i class="pi pi-box"></i>
            {{ t('tasks.review.requestedMaterials') }}
          </label>

          <div class="parts-summary">
            <div
                v-for="part in taskToReview.parts"
                :key="part.inventoryItemId"
                class="part-summary-item"
            >
              <div>
                <strong>{{ part.quantity }}x</strong>
                {{ part.name }}
              </div>

              <span>
                S/.
                {{
                  ((part.unitPrice || 0) * part.quantity).toFixed(2)
                }}
              </span>
            </div>

            <div class="parts-total">
              {{ t('tasks.review.partsSubtotal') }}

              <strong>
                S/.
                {{
                  taskToReview.parts
                      .reduce(
                          (sum, part) =>
                              sum + (part.unitPrice * part.quantity),
                          0
                      )
                      .toFixed(2)
                }}
              </strong>
            </div>
          </div>
        </div>

        <div class="review-actions">
          <Button
              :label="t('tasks.review.rejectButton')"
              icon="pi pi-times"
              severity="danger"
              outlined
              @click="rejectTask"
          />

          <Button
              :label="t('tasks.review.approveButton')"
              icon="pi pi-check"
              severity="success"
              @click="approveTask"
          />
        </div>

      </div>
    </Dialog>

  </section>
</template>

<style scoped>
.tasks-page {
  min-height: 100%;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 0.5rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #0b1680;
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
  max-width: 620px;
  margin: 0.75rem 0 0;
  color: #64748b;
}

/* KPIs */
.summary-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  padding: 1rem 1.2rem;
  border: 1px solid #e8edf5;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 0.25rem;
  color: #0b1680;
  font-size: 1.8rem;
  line-height: 1;
}

.summary-card.success strong {
  color: #16a34a;
}

/* Tasks grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

/* Empty / loading */
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
  margin-bottom: 0.75rem;
  color: #0b1680;
  font-size: 2.5rem;
}

.empty-state h3 {
  margin: 0;
  color: #0f172a;
}

/* Review dialog */
.review-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem 0;
}

.review-field label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.review-field p {
  margin: 0;
  padding: 0.75rem 1rem;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.6;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.evidence-link {
  color: #0b1680 !important;
  font-weight: 600;
  word-break: break-all;
}

/* Parts summary */
.parts-summary {
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.part-summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  color: #334155;
  font-size: 0.95rem;
  border-bottom: 1px dashed #e2e8f0;
}

.part-summary-item strong {
  margin-right: 0.4rem;
  color: #0b1680;
  font-weight: 800;
}

.parts-total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  color: #64748b;
  font-size: 0.9rem;
  text-align: right;
}

.parts-total strong {
  margin-left: 0.5rem;
  color: #0f172a;
  font-size: 1.15rem;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .tasks-header {
    flex-direction: column;
  }
}
</style>