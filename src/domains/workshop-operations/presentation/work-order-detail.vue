<script setup>
/**
 * Work order detail view.
 * Displays work order information, related tasks and automatic quotation.
 */

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

import { useAuthStore } from '../../auth/application/auth.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';
import { useTaskStore } from '../application/task.store';
import { useWorkOrderStore } from '../application/work-order.store';

import TaskDialog from './components/tasks/TaskDialog.vue';

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();
const mechanicStore = useMechanicStore();
const authStore = useAuthStore();

// ── State ────────────────────────────────────────────────
const orderId = route.params.id;

const taskDialogVisible = ref(false);

// ── Computed ─────────────────────────────────────────────
const isMechanic = computed(() =>
    authStore.userRole === 'mechanic'
);

const currentOrder = computed(() =>
    workOrderStore.workOrders.find(
        order => String(order.id) === String(orderId)
    ) || null
);

const orderTasks = computed(() =>
    taskStore.tasks.filter(
        task => String(task.workOrderId) === String(orderId)
    )
);

const calculatedTotal = computed(() => {
  let total = 0;

  orderTasks.value.forEach(task => {
    total += parseFloat(task.laborPrice || 0);
  });

  return total.toFixed(2);
});

// ── Lifecycle ────────────────────────────────────────────

/**
 * Loads required page data.
 * @returns {Promise<void>}
 */
const loadData = async () => {
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    taskStore.fetchAllTasks(),
    mechanicStore.fetchMechanics()
  ]);
};

onMounted(() => loadData());

// ── Actions ──────────────────────────────────────────────

/**
 * Opens task creation dialog.
 */
const openTaskDialog = () => {
  taskDialogVisible.value = true;
};

/**
 * Persists a new task.
 * @param {Object} taskData
 * @returns {Promise<void>}
 */
const handleTaskSave = async (taskData) => {
  taskDialogVisible.value = false;

  await taskStore.addTask({
    ...taskData,
    workOrderId: parseInt(orderId, 10),
    mechanicId: parseInt(currentOrder.value.mechanicId, 10),
    estimatedTime: parseInt(taskData.estimatedTime || 0, 10),
    laborPrice: parseFloat(taskData.laborPrice || 0)
  });

  await workOrderStore.updateOrderAutoPrice(
      orderId,
      calculatedTotal.value
  );
};

/**
 * Navigates back depending on user role.
 */
const goBack = () => {
  if (isMechanic.value) {
    router.push('/mechanic/workspace');
    return;
  }

  router.push('/work-orders');
};
</script>

<template>
  <div
      v-if="currentOrder"
      class="detail-container"
  >
    <div class="header-actions">
      <Button
          icon="pi pi-arrow-left"
          text
          :label="t('workOrderDetail.actions.back')"
          @click="goBack"
      />

      <h2>
        {{
          t('workOrderDetail.title', {
            code: currentOrder.trackingCode || currentOrder.id
          })
        }}
      </h2>
    </div>

    <div class="layout-grid">

      <div class="main-column">

        <Card class="info-card">
          <template #title>
            {{ t('workOrderDetail.initialDescription') }}
          </template>

          <template #content>
            <p>{{ currentOrder.description }}</p>
          </template>
        </Card>

        <Card class="tasks-card mt-4">
          <template #title>
            <div class="flex justify-content-between align-items-center">

              <span>
                {{ t('workOrderDetail.tasks.title') }}
              </span>

              <Button
                  v-if="isMechanic"
                  :label="t('workOrderDetail.tasks.addTask')"
                  icon="pi pi-plus"
                  size="small"
                  class="p-button-outlined"
                  @click="openTaskDialog"
              />

            </div>
          </template>

          <template #content>
            <DataTable
                :value="orderTasks"
                :empty-message="t('workOrderDetail.tasks.empty')"
            >
              <Column
                  field="description"
                  :header="t('workOrderDetail.tasks.columns.task')"
              />

              <Column
                  field="status"
                  :header="t('workOrderDetail.tasks.columns.status')"
              />

              <Column
                  field="laborPrice"
                  :header="t('workOrderDetail.tasks.columns.labor')"
              >
                <template #body="slotProps">
                  S/. {{ slotProps.data.laborPrice }}
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

      </div>

      <div class="side-column">

        <Card class="price-card">
          <template #title>
            {{ t('workOrderDetail.quote.title') }}
          </template>

          <template #content>
            <div class="total-display">
              <span>S/. {{ calculatedTotal }}</span>
            </div>
          </template>
        </Card>

      </div>

    </div>

    <TaskDialog
        v-if="isMechanic"
        v-model:visible="taskDialogVisible"
        :work-order-options="[currentOrder]"
        :mechanic-options="mechanicStore.mechanics"
        @save="handleTaskSave"
        @cancel="taskDialogVisible = false"
    />
  </div>
</template>

<style scoped>
.detail-container {
  padding: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-actions h2 {
  margin: 0;
}

.layout-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.total-display {
  padding: 1.5rem 0;
  color: #0b1680;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
}

@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>