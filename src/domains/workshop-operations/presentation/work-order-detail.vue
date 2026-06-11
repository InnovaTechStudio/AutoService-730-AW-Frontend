<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Message from 'primevue/message';
import Tag from 'primevue/tag';

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

const orderId = route.params.id;
const taskDialogVisible = ref(false);

const isMechanic = computed(() => authStore.userRole === 'mechanic');

const currentOrder = computed(() =>
    workOrderStore.workOrders.find(order => String(order.id) === String(orderId)) || null
);

const orderTasks = computed(() =>
    taskStore.tasks.filter(task => String(task.workOrderId) === String(orderId))
);

/*const calculatedTotal = computed(() => {
  let total = 0;
  orderTasks.value.forEach(task => {
    const labor = parseFloat(task.laborPrice || 0);
    const partsTotal = (task.parts || []).reduce((sum, p) => sum + (parseFloat(p.unitPrice || 0) * parseInt(p.quantity || 1)), 0);
    total += labor + partsTotal;
  });
  console.log(orderTasks.value);
  return total.toFixed(2);
});*/
const calculatedTotal = computed(() => {
  let total = 0;

  orderTasks.value.forEach(task => {
    total +=
        Number(task.laborPrice || 0) +
        Number(task.materialsCost || 0);
  });

  return total.toFixed(2);
});


const loadData = async () => {
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    taskStore.fetchAllTasks(),
    mechanicStore.fetchMechanics()
  ]);
};

onMounted(() => loadData());

const openTaskDialog = () => { taskDialogVisible.value = true; };

const handleTaskSave = async (taskData) => {
  taskDialogVisible.value = false;
  await taskStore.addTask({
    ...taskData,
    workOrderId: parseInt(orderId, 10),
    mechanicId: parseInt(currentOrder.value.mechanicId, 10),
    estimatedTime: parseFloat(taskData.estimatedTime || 0),
    laborPrice: parseFloat(taskData.laborPrice || 0)
  });
  await workOrderStore.updateOrderAutoPrice(orderId, calculatedTotal.value);
};

const deliverOrder = async () => {
  if (!currentOrder.value) return;
  await workOrderStore.updateWorkOrderChecklist(orderId, {
    ...currentOrder.value,
    status: 'DELIVERED'
  });
  await workOrderStore.fetchWorkOrders();
};

const goBack = () => {
  if (isMechanic.value) {
    router.push('/mechanic/workspace');
    return;
  }
  router.push('/work-orders');
};
</script>

<template>
  <div v-if="currentOrder" class="detail-container">
    <div class="header-actions">
      <Button icon="pi pi-arrow-left" text :label="t('workOrderDetail.actions.back')" @click="goBack" />
      <h2>{{ t('workOrderDetail.title', { code: currentOrder.trackingCode || currentOrder.id }) }}</h2>
    </div>

    <div class="layout-grid">
      <div class="main-column">
        <Card class="info-card">
          <template #title>{{ t('workOrderDetail.initialDescription') }}</template>
          <template #content><p>{{ currentOrder.description }}</p></template>
        </Card>

        <Card class="tasks-card mt-4">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>{{ t('workOrderDetail.tasks.title') }}</span>
              <Button v-if="isMechanic" :label="t('workOrderDetail.tasks.addTask')" icon="pi pi-plus" size="small" class="p-button-outlined" @click="openTaskDialog" />
            </div>
          </template>
          <template #content>
            <DataTable :value="orderTasks" :empty-message="t('workOrderDetail.tasks.empty')">

              <Column field="description" :header="t('workOrderDetail.tasks.columns.task')" />

              <Column field="status" :header="t('workOrderDetail.tasks.columns.status')">
                <template #body="slotProps">
                  <Tag
                      :value="$t(`taskStatus.${(slotProps.data.status || 'pending').toLowerCase()}`)"
                      :severity="slotProps.data.status === 'COMPLETED' ? 'success' : 'warning'"
                  />
                </template>
              </Column>

              <Column :header="t('workOrderDetail.tasks.columns.materials')">
                <template #body="slotProps">
                  <div v-if="slotProps.data.parts && slotProps.data.parts.length > 0" class="materials-list">
                    <div v-for="(p, i) in slotProps.data.parts" :key="i" class="material-item">
                      {{ p.quantity }}x {{ p.name }} <span class="material-price">(S/. {{ ((p.unitPrice || 0) * (p.quantity || 1)).toFixed(2) }})</span>
                    </div>
                  </div>
                  <span v-else class="text-gray">{{ t('workOrderDetail.tasks.noMaterials') }}</span>
                </template>
              </Column>

              <Column field="laborPrice" :header="t('workOrderDetail.tasks.columns.labor')">
                <template #body="slotProps">
                  <span class="font-bold">S/. {{ slotProps.data.laborPrice }}</span>
                </template>
              </Column>
              <Column
                  field="materialsCost"
                  header="Materiales">
                <template #body="slotProps">
                  <span class="font-bold">S/. {{ Number(slotProps.data.materialsCost || 0).toFixed(2) }}</span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <div class="side-column">
        <Card class="price-card">
          <template #title>{{ t('workOrderDetail.quote.title') }}</template>
          <template #content>
            <div class="total-display">
              <span>S/. {{ calculatedTotal }}</span>
            </div>

            <div v-if="!isMechanic && currentOrder.status === 'FINISHED'" class="admin-validation mt-4">
              <Message severity="success" :closable="false" class="mb-3">
                {{ t('workOrderDetail.validation.readyMessage') }}
              </Message>
              <Button
                  :label="t('workOrderDetail.validation.deliverButton')"
                  icon="pi pi-check-square"
                  severity="success"
                  class="w-full"
                  @click="deliverOrder"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>

    <TaskDialog v-if="isMechanic" v-model:visible="taskDialogVisible" :work-order-options="[currentOrder]" :mechanic-options="mechanicStore.mechanics" @save="handleTaskSave" @cancel="taskDialogVisible = false" />
  </div>
</template>

<style scoped>
.detail-container { padding: 2rem; }
.header-actions { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.header-actions h2 { margin: 0; }
.layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
.mt-4 { margin-top: 1.5rem; }
.mb-3 { margin-bottom: 1rem; }
.flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }

.materials-list { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; }
.material-item { display: inline-block; background: #f8fafc; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; }
.material-price { color: #64748b; margin-left: 0.25rem; }
.text-gray { color: #94a3b8; font-style: italic; font-size: 0.9rem; }
.font-bold { font-weight: bold; }

.total-display { padding: 1.5rem 0; color: #0b1680; font-size: 2.5rem; font-weight: bold; text-align: center; }
.w-full { width: 100%; }
.admin-validation { padding-top: 1rem; border-top: 1px solid #e2e8f0; }
@media (max-width: 768px) { .layout-grid { grid-template-columns: 1fr; } }
</style>