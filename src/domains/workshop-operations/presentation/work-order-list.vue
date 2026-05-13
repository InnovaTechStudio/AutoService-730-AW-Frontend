<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWorkOrderStore } from '../application/work-order.store';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useCustomerStore } from '../../customer-management/application/customer.store';
import { useTaskStore } from '../application/task.store';
import { useRouter } from 'vue-router';

import Button from 'primevue/button';
import WorkOrderFilters from './components/work-orders/WorkOrderFilters.vue';
import WorkOrderCard from './components/work-orders/WorkOrderCard.vue';

const { t } = useI18n();
const workOrderStore = useWorkOrderStore();
const vehicleStore = useVehicleStore();
const customerStore = useCustomerStore();
const taskStore = useTaskStore();
const router = useRouter();

const search = ref('');
const selectedStatus = ref(null);

const statusOptions = computed(() => [
  { label: t('workOrders.statusOptions.pending'), value: 'Pendiente' },
  { label: t('workOrders.statusOptions.inProgress'), value: 'En Proceso' },
  { label: t('workOrders.statusOptions.completed'), value: 'Finalizado' },
  { label: t('workOrders.statusOptions.cancelled'), value: 'Cancelado' }
]);

onMounted(async () => {
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    vehicleStore.fetchVehicles(),
    customerStore.fetchCustomers(),
    taskStore.fetchAllTasks()
  ]);
});

const getVehiclePlate = (id) =>
    vehicleStore.vehicles.find((v) => String(v.id) === String(id))?.plate || '---';

const getVehicleName = (id) => {
  const vehicle = vehicleStore.vehicles.find((v) => String(v.id) === String(id));
  return vehicle ? `${vehicle.brand || 'Vehículo'} ${vehicle.model || ''} - ${vehicle.plate}` : t('common.notFound');
};

const getCustomerName = (id) => {
  if (!id) return '---';
  const customer = customerStore.customers.find((c) => String(c.id) === String(id));
  return customer ? customer.fullName : t('common.notFound');
};

const calculateProgress = (orderId) => {
  const tasks = taskStore.tasks.filter((task) => String(task.workOrderId) === String(orderId));
  if (!tasks.length) return 0;
  const completed = tasks.filter((task) => ['Completada', 'Finalizada', 'Listo'].includes(task.status)).length;
  return Math.round((completed / tasks.length) * 100);
};

const getSeverity = (status) => {
  if (status === 'Finalizado' || status === 'Completado') return 'success';
  if (status === 'En Proceso') return 'info';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Cancelado') return 'danger';
  return 'secondary';
};

const isRiskOrder = (order) => {
  const progress = calculateProgress(order.id);
  return order.status === 'En Proceso' && progress < 50;
};

const ordersView = computed(() =>
    workOrderStore.workOrders.map((order) => ({
      id: order.id,
      raw: order,
      trackingCode: order.trackingCode || `WO-${order.id}`,
      vehiclePlate: getVehicleName(order.vehicleId),
      plateOnly: getVehiclePlate(order.vehicleId),
      customerName: getCustomerName(order.customerId),
      progress: calculateProgress(order.id),
      startDate: order.startDate,
      estimatedDate: order.estimatedDate,
      status: order.status || 'Pendiente',
      severity: getSeverity(order.status),
      price: order.price || 0,
      isRisk: isRiskOrder(order)
    }))
);

const filteredOrders = computed(() => {
  const term = search.value.toLowerCase().trim();
  return ordersView.value.filter((order) => {
    const matchesSearch = !term || order.trackingCode.toLowerCase().includes(term) || order.vehiclePlate.toLowerCase().includes(term) || order.plateOnly.toLowerCase().includes(term) || order.customerName.toLowerCase().includes(term);
    const matchesStatus = !selectedStatus.value || order.status === selectedStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const activeOrders = computed(() => workOrderStore.workOrders.filter((o) => o.status === 'En Proceso').length);
const riskOrders = computed(() => ordersView.value.filter((o) => o.isRisk).length);
const completedOrders = computed(() => workOrderStore.workOrders.filter((o) => ['Finalizado', 'Completado'].includes(o.status)).length);

const viewDetail = (order) => { router.push(`/work-orders/${order.id}`); };
</script>

<template>
  <section class="work-orders-page">
    <div class="work-orders-header">
      <div>
        <span class="eyebrow">{{ t('workOrders.eyebrow') }}</span>
        <h1>{{ t('workOrders.title') }}</h1>
        <p>{{ t('workOrders.description') }}</p>
      </div>
      <Button :label="t('workOrders.newButton')" icon="pi pi-plus" class="add-button" @click="router.push('/work-orders/new')" />
    </div>

    <div class="summary-row">
      <div class="summary-card"><span>{{ t('workOrders.summary.total') }}</span><strong>{{ workOrderStore.workOrders.length }}</strong></div>
      <div class="summary-card"><span>{{ t('workOrders.summary.inProgress') }}</span><strong>{{ activeOrders }}</strong></div>
      <div class="summary-card warning"><span>{{ t('workOrders.summary.riskDelay') }}</span><strong>{{ riskOrders }}</strong></div>
      <div class="summary-card"><span>{{ t('workOrders.summary.completed') }}</span><strong>{{ completedOrders }}</strong></div>
    </div>

    <WorkOrderFilters v-model:search="search" v-model:status="selectedStatus" :status-options="statusOptions" />

    <div v-if="workOrderStore.loading" class="empty-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>{{ t('workOrders.loading') }}</p>
    </div>

    <div v-else-if="filteredOrders.length" class="orders-grid">
      <WorkOrderCard v-for="order in filteredOrders" :key="order.id" :order="order" @view-detail="viewDetail" />
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-file-edit"></i>
      <h3>{{ t('workOrders.empty.title') }}</h3>
      <p>{{ t('workOrders.empty.description') }}</p>
    </div>
  </section>
</template>

<style scoped>
.work-orders-page { min-height: 100%; }
.work-orders-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 1.5rem; }
.eyebrow { display: inline-flex; margin-bottom: 0.5rem; color: #0b1680; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.work-orders-header h1 { margin: 0; color: #0f172a; font-size: clamp(2rem,4vw,2.7rem); line-height: 1.05; letter-spacing: -0.04em; }
.work-orders-header p { max-width: 680px; margin: 0.75rem 0 0; color: #64748b; }
.add-button { background: #0b1680; border-color: #0b1680; border-radius: 14px; }
.summary-row { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 1rem; margin-bottom: 1.25rem; }
.summary-card { padding: 1rem 1.2rem; border: 1px solid #e8edf5; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 24px rgba(15,23,42,0.05); }
.summary-card span { display: block; color: #64748b; font-weight: 700; }
.summary-card strong { display: block; margin-top: 0.25rem; color: #0b1680; font-size: 1.8rem; }
.summary-card.warning strong { color: #c2410c; }
.orders-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; }
.empty-state { display: grid; place-items: center; min-height: 260px; text-align: center; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 24px; background: #ffffff; }
.empty-state i { color: #0b1680; font-size: 2rem; margin-bottom: 0.75rem; }
.empty-state h3 { margin: 0; color: #0f172a; }
@media (max-width: 1100px) { .summary-row, .orders-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media (max-width: 768px) { .work-orders-header { flex-direction: column; } .add-button { width: 100%; } .summary-row, .orders-grid { grid-template-columns: 1fr; } }
</style>