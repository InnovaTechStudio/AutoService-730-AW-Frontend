<template>
  <div class="dashboard-container">
    <h1 class="mb-4">{{ t('dashboard.title') }}</h1>

    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card shadow-1 border-left-blue">
          <template #content>
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('dashboard.vehiclesInWorkshop') }}</span>
                <div class="text-900 font-bold text-3xl">{{ vehiclesInWorkshop }}</div>
              </div>
              <div class="kpi-icon bg-blue-100"><i class="pi pi-car text-blue-500 text-xl"></i></div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card shadow-1 border-left-orange">
          <template #content>
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('dashboard.activeOrders') }}</span>
                <div class="text-900 font-bold text-3xl">{{ activeOrders }}</div>
              </div>
              <div class="kpi-icon bg-orange-100"><i class="pi pi-file-edit text-orange-500 text-xl"></i></div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card shadow-1 border-left-teal">
          <template #content>
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('dashboard.pendingTasks') }}</span>
                <div class="text-900 font-bold text-3xl">{{ pendingTasks }}</div>
              </div>
              <div class="kpi-icon bg-teal-100"><i class="pi pi-check-square text-teal-500 text-xl"></i></div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="kpi-card shadow-1 border-left-green">
          <template #content>
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('dashboard.projectedIncome') }}</span>
                <div class="text-900 font-bold text-3xl">S/. {{ projectedIncome }}</div>
              </div>
              <div class="kpi-icon bg-green-100"><i class="pi pi-money-bill text-green-500 text-xl"></i></div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-7">
        <div class="card p-4 bg-white border-round shadow-1 h-full flex flex-column">
          <h3>{{ t('dashboard.fleetStatus') }}</h3>
          <p class="text-500 text-sm mt-0 mb-4">{{ t('dashboard.fleetSubtitle') }}</p>
          <div class="flex-1 flex justify-content-center align-items-center" style="max-height:300px;position:relative">
            <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full" style="max-height:300px" />
          </div>
        </div>
      </div>

      <div class="col-12 lg:col-5">
        <div class="card p-4 bg-white border-round shadow-1 mb-4">
          <h3 class="m-0 mb-3">{{ t('dashboard.quickActions') }}</h3>
          <div class="grid">
            <div class="col-12 md:col-4">
              <Button :label="t('dashboard.newCustomer')" icon="pi pi-user-plus" severity="secondary" outlined class="w-full" @click="router.push('/customers')" />
            </div>
            <div class="col-12 md:col-4">
              <Button :label="t('dashboard.newVehicle')" icon="pi pi-car" severity="secondary" outlined class="w-full" @click="router.push('/vehicles')" />
            </div>
            <div class="col-12 md:col-4">
              <Button :label="t('dashboard.newOrder')" icon="pi pi-file-edit" class="w-full" @click="router.push('/work-orders/new')" />
            </div>
          </div>
        </div>

        <div class="card p-4 bg-white border-round shadow-1 h-full">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="m-0">{{ t('dashboard.recentActivity') }}</h3>
            <Button :label="t('dashboard.viewAll')" text size="small" @click="router.push('/work-orders')" />
          </div>
          <DataTable :value="recentOrders" class="p-datatable-sm" responsiveLayout="scroll">
            <Column field="trackingCode" :header="t('workOrders.colCode')"></Column>
            <Column field="status" :header="t('workOrders.colStatus')">
              <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'Finalizado' ? 'success' : 'info'" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useWorkOrderStore } from '../application/work-order.store';
import { useTaskStore } from '../application/task.store';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Chart from 'primevue/chart';
import Tag from 'primevue/tag';

const { t } = useI18n();
const router = useRouter();
const vehicleStore = useVehicleStore();
const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();

const vehiclesInWorkshop = computed(() => vehicleStore.vehicles.filter(v => v.status === 'En Taller').length);
const activeOrders = computed(() => workOrderStore.workOrders.filter(wo => wo.status === 'En Proceso').length);
const pendingTasks = computed(() => taskStore.tasks.filter(t => t.status !== 'Completada').length);
const projectedIncome = computed(() => workOrderStore.workOrders.filter(wo => wo.status === 'En Proceso').reduce((acc, wo) => acc + (parseFloat(wo.price) || 0), 0));
const recentOrders = computed(() => [...workOrderStore.workOrders].reverse().slice(0, 5));

const chartData = ref(null);
const chartOptions = ref({ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '60%' });

const setChartData = () => {
  const statusCounts = { 'En Taller': 0, 'Listo': 0 };
  vehicleStore.vehicles.forEach(v => {
    if (v.status !== 'Entregado') {
      if (statusCounts[v.status] !== undefined) statusCounts[v.status]++;
      else statusCounts[v.status] = 1;
    }
  });
  chartData.value = {
    labels: Object.keys(statusCounts),
    datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#f59e0b', '#10b981'], hoverBackgroundColor: ['#fbbf24', '#34d399'] }]
  };
};

onMounted(async () => {
  await Promise.all([vehicleStore.fetchVehicles(), workOrderStore.fetchWorkOrders(), taskStore.fetchAllTasks()]);
  setChartData();
});
</script>

<style scoped>
.kpi-card { border-radius: 12px; }
.kpi-icon { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; }
.border-left-blue { border-left: 5px solid #3b82f6; }
.border-left-orange { border-left: 5px solid #f59e0b; }
.border-left-teal { border-left: 5px solid #14b8a6; }
.border-left-green { border-left: 5px solid #10b981; }
</style>
