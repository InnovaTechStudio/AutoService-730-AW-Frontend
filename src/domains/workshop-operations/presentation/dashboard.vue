<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';

import DashboardHeader from './components/dashboard/DashboardHeader.vue';
import DashboardMetricCard from './components/dashboard/DashboardMetricCard.vue';
import ActiveVehiclesPanel from './components/dashboard/ActiveVehiclesPanel.vue';
import WeeklyIncomePanel from './components/dashboard/WeeklyIncomePanel.vue';
import RecentOrdersPanel from './components/dashboard/RecentOrdersPanel.vue';
import FrequentServicesPanel from './components/dashboard/FrequentServicesPanel.vue';

const router = useRouter();
const vehicleStore = useVehicleStore();
const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();

const fallbackVehicleImages = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop'
];

const vehiclesInWorkshop = computed(() =>
    vehicleStore.vehicles.filter((vehicle) => vehicle.status !== 'Entregado').length
);

const activeOrders = computed(() =>
    workOrderStore.workOrders.filter((order) => order.status === 'En Proceso').length
);

const completedOrders = computed(() =>
    workOrderStore.workOrders.filter((order) =>
        ['Finalizado', 'Completado', 'Listo'].includes(order.status)
    ).length
);

const projectedIncome = computed(() =>
    workOrderStore.workOrders
        .filter((order) => order.status !== 'Cancelado')
        .reduce((acc, order) => acc + (parseFloat(order.price) || 0), 0)
);

const weeklyIncome = computed(() => projectedIncome.value || 1500);

const recentOrders = computed(() =>
    [...workOrderStore.workOrders].reverse().slice(0, 5)
);

const activeVehiclePreview = computed(() => {
  const vehicles = vehicleStore.vehicles.length
      ? vehicleStore.vehicles
      : [
        { id: 1, brand: 'Audi', model: 'A4 Premium', status: 'En Proceso' },
        { id: 2, brand: 'BMW', model: 'X5', status: 'Pendiente' },
        { id: 3, brand: 'Tesla', model: 'Model 3', status: 'Completado' }
      ];

  return vehicles
      .filter((vehicle) => vehicle.status !== 'Entregado')
      .slice(0, 4)
      .map((vehicle, index) => ({
        id: vehicle.id || index,
        name: `${vehicle.brand || vehicle.make || 'Vehicle'} ${vehicle.model || ''}`,
        status: vehicle.status || 'Pendiente',
        severity: getVehicleSeverity(vehicle.status),
        progress: getProgressByStatus(vehicle.status),
        image: vehicle.image || fallbackVehicleImages[index % fallbackVehicleImages.length]
      }));
});

const frequentServices = ref([
  { name: 'Cambio de aceite', count: 12, amount: 540, progress: 86, icon: 'pi pi-cog' },
  { name: 'Reparación de frenos', count: 8, amount: 820, progress: 68, icon: 'pi pi-wrench' },
  { name: 'Rotación de neumáticos', count: 5, amount: 140, progress: 44, icon: 'pi pi-refresh' }
]);

const weeklyIncomeData = ref({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  datasets: [
    {
      label: 'Ingresos',
      data: [380, 520, 460, 610, 900, 300],
      backgroundColor: ['#dbeafe', '#bfdbfe', '#dbeafe', '#bfdbfe', '#0b1680', '#e5e7eb'],
      borderRadius: 12
    }
  ]
});

const barChartOptions = ref({
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b' }
    },
    y: {
      grid: { color: '#eef2f7' },
      ticks: { display: false },
      border: { display: false }
    }
  }
});

const getProgressByStatus = (status) => {
  if (['Completado', 'Finalizado', 'Listo'].includes(status)) return 100;
  if (['En Proceso', 'En Taller'].includes(status)) return 65;
  if (status === 'Pendiente') return 10;
  return 35;
};

const getVehicleSeverity = (status) => {
  if (['Completado', 'Finalizado', 'Listo'].includes(status)) return 'success';
  if (['En Proceso', 'En Taller'].includes(status)) return 'info';
  if (status === 'Pendiente') return 'warning';
  return 'secondary';
};

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchVehicles(),
    workOrderStore.fetchWorkOrders(),
    taskStore.fetchAllTasks()
  ]);
});
</script>



<template>
  <section class="admin-dashboard">
    <DashboardHeader
        @create-order="router.push('/work-orders/new')"
        @view-orders="router.push('/work-orders')"
    />

    <div class="kpi-grid">
      <DashboardMetricCard
          title="Vehículos activos"
          :value="vehiclesInWorkshop"
          subtitle="En atención actualmente"
          icon="pi pi-car"
          color="blue"
      />

      <DashboardMetricCard
          title="Órdenes activas"
          :value="activeOrders"
          subtitle="Servicios en proceso"
          icon="pi pi-file-edit"
          color="indigo"
      />

      <DashboardMetricCard
          title="Completados"
          :value="completedOrders"
          subtitle="Órdenes finalizadas"
          icon="pi pi-check-circle"
          color="green"
      />

      <DashboardMetricCard
          title="Ingresos proyectados"
          :value="`S/. ${projectedIncome}`"
          subtitle="Según órdenes activas"
          icon="pi pi-wallet"
          color="violet"
      />
    </div>

    <div class="dashboard-grid">
      <ActiveVehiclesPanel
          :vehicles="activeVehiclePreview"
          @view-vehicles="router.push('/vehicles')"
      />

      <WeeklyIncomePanel
          :weeklyIncome="weeklyIncome"
          :chartData="weeklyIncomeData"
          :chartOptions="barChartOptions"
      />

      <RecentOrdersPanel
          :orders="recentOrders"
          @view-orders="router.push('/work-orders')"
      />

      <FrequentServicesPanel :services="frequentServices" />
    </div>
  </section>
</template>



<style scoped>
.admin-dashboard {
  min-height: 100%;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 1.25rem;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>