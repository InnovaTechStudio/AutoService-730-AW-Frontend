<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../auth/application/auth.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import LanguageSwitcher from '../../../shared/presentation/language-switcher.vue';

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const workOrderStore = useWorkOrderStore();

const statusOptions = computed(() => [
  { label: t('mechanicDashboard.statuses.pending'), value: 'Pendiente' },
  { label: t('mechanicDashboard.statuses.inProgress'), value: 'En Proceso' },
  { label: t('mechanicDashboard.statuses.completed'), value: 'Completada' }
]);

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
  return order?.trackingCode || t('mechanicDashboard.noOrder');
};

const getSeverity = (status) => {
  if (status === t('mechanicDashboard.statuses.completed')) return 'success';
  if (status === t('mechanicDashboard.statuses.inProgress')) return 'info';
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
        <span class="eyebrow">{{ t('mechanicDashboard.eyebrow') }}</span>
        <h1>{{ t('mechanicDashboard.title') }}</h1>
        <p>{{ t('mechanicDashboard.description') }}</p>
      </div>

      <div class="header-actions">
        <LanguageSwitcher />
        <Button :label="t('mechanicDashboard.logout')" icon="pi pi-sign-out" outlined severity="danger" @click="logout" />
      </div>
    </div>

    <div class="summary-row">
      <Card class="summary-card"><template #content><span>{{ t('mechanicDashboard.pending') }}</span><strong>{{ pendingTasks }}</strong></template></Card>
      <Card class="summary-card"><template #content><span>{{ t('mechanicDashboard.inProgress') }}</span><strong>{{ progressTasks }}</strong></template></Card>
      <Card class="summary-card"><template #content><span>{{ t('mechanicDashboard.completed') }}</span><strong>{{ completedTasks }}</strong></template></Card>
    </div>

    <div class="tasks-grid">
      <Card v-for="task in myTasks" :key="task.id" class="task-card">
        <template #content>
          <div class="task-top">
            <div>
              <Tag :value="getOrderCode(task.workOrderId)" severity="secondary" rounded />
              <h3>{{ task.description }}</h3>
            </div>

            <Tag :value="task.status === 'Pendiente' ? t('mechanicDashboard.statuses.pending') : task.status === 'En Proceso' ? t('mechanicDashboard.statuses.inProgress') : t('mechanicDashboard.statuses.completed')" :severity="getSeverity(task.status)" rounded />
          </div>

          <div class="field">
            <label>{{ t('mechanicDashboard.updateStatus') }}</label>
            <Dropdown
                :model-value="task.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                @update:model-value="updateStatus(task, $event)"
            />
          </div>

          <Button
              :label="t('mechanicDashboard.viewOrder')"
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
      <h3>{{ t('mechanicDashboard.emptyTitle') }}</h3>
      <p>{{ t('mechanicDashboard.emptyDescription') }}</p>
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


.header-actions {
  display:flex;
  align-items:center;
  gap:1rem;
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