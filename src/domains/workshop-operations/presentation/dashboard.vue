<script setup>
/**
 * @file AdminDashboardPage.vue
 * @description Dashboard principal para administración de órdenes y métricas.
 */

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useWorkOrderStore } from '../application/work-order.store.js';
import { useTaskStore } from '../application/task.store.js';

import DashboardHeader from './components/dashboard/DashboardHeader.vue';
import DashboardMetricCard from './components/dashboard/DashboardMetricCard.vue';
import ActiveVehiclesPanel from './components/dashboard/ActiveVehiclesPanel.vue';
import WeeklyIncomePanel from './components/dashboard/WeeklyIncomePanel.vue';
import RecentOrdersPanel from './components/dashboard/RecentOrdersPanel.vue';
import FrequentServicesPanel from './components/dashboard/FrequentServicesPanel.vue';

// ── CONSTANTS FOR DOMAIN LOGIC ───────────────────────────
/** Standardized system work order states */
const ORDER_STATUS = {
  PENDING: 'PENDING',
  PENDING_DIAGNOSIS: 'PENDING_DIAGNOSIS',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

/** Standardized system task states */
const TASK_STATUS = {
  COMPLETED: 'COMPLETED'
};

const { t, locale } = useI18n();

const router = useRouter();

const vehicleStore = useVehicleStore();
const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();

const fallbackImage =
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&auto=format&fit=crop';

onMounted(async () => {
  try {
    await Promise.all([
      vehicleStore.fetchVehicles(),
      workOrderStore.fetchWorkOrders(),
      taskStore.fetchAllTasks()
    ]);
  } catch (error) {
    console.error(error);
  }
});

/**
 * Determina si una orden está activa basándose en constantes estándar.
 *
 * @param {string} status
 * @returns {boolean}
 */
const isStatusActive = (status) =>
    [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PENDING_DIAGNOSIS,
      ORDER_STATUS.IN_PROGRESS
    ].includes(status);

/**
 * Determina si una orden está completada u operacionalmente cerrada basándose en constantes estándar.
 *
 * @param {string} status
 * @returns {boolean}
 */
const isStatusCompleted = (status) =>
    [
      ORDER_STATUS.FINISHED,
      ORDER_STATUS.DELIVERED
    ].includes(status);

/**
 * Vehículos únicos actualmente en taller.
 */
const vehiclesInWorkshop = computed(() => {
  const activeOrders = workOrderStore.workOrders.filter((order) =>
      isStatusActive(order.status)
  );

  const uniqueVehicleIds = new Set(
      activeOrders.map((order) => order.vehicleId)
  );

  return uniqueVehicleIds.size;
});

/**
 * Cantidad de órdenes activas.
 */
const activeOrdersCount = computed(() =>
    workOrderStore.workOrders.filter((order) =>
        isStatusActive(order.status)
    ).length
);

/**
 * Cantidad de órdenes completadas.
 */
const completedOrdersCount = computed(() =>
    workOrderStore.workOrders.filter((order) =>
        isStatusCompleted(order.status)
    ).length
);

/**
 * Ingreso proyectado total.
 * Excluye los estados anulados/cancelados del sistema.
 */
const projectedIncome = computed(() =>
    workOrderStore.workOrders
        .filter((order) => order.status !== ORDER_STATUS.CANCELLED)
        .reduce(
            (accumulator, order) =>
                accumulator + (parseFloat(order.price) || 0),
            0
        )
);

/**
 * Calcula el progreso de tareas de una orden utilizando códigos globales.
 *
 * @param {string|number} orderId
 * @returns {number}
 */
const getOrderProgress = (orderId) => {
  const tasks = taskStore.tasks.filter(
      (task) => String(task.workOrderId) === String(orderId)
  );

  if (!tasks.length) {
    return 0;
  }

  const completedTasks = tasks.filter(
      (task) => task.status === TASK_STATUS.COMPLETED
  ).length;

  return Math.round(
      (completedTasks / tasks.length) * 100
  );
};

/**
 * Vista resumida de vehículos activos.
 */
const activeVehiclePreview = computed(() => {
  const activeOrders = workOrderStore.workOrders.filter((order) =>
      isStatusActive(order.status)
  );

  return activeOrders
      .slice(0, 4)
      .map((order) => {
        const vehicle =
            vehicleStore.vehicles.find(
                (v) => String(v.id) === String(order.vehicleId)
            ) || {};

        const progress = getOrderProgress(order.id);

        return {
          id: vehicle.id || order.id,
          name: `${vehicle.brand || t('dashboard.defaults.vehicle')} ${vehicle.model || ''}`,
          status:
              progress === 100
                  ? t('dashboard.vehicleStatus.qaReady')
                  : t('dashboard.vehicleStatus.inRepair'),
          severity: progress === 100 ? 'success' : 'info',
          progress,
          image: vehicle.image || fallbackImage
        };
      })
      .sort((a, b) => b.progress - a.progress);
});

/**
 * Servicios más frecuentes.
 */
const frequentServices = computed(() => {
  const taskMap = {};

  taskStore.tasks.forEach((task) => {
    const serviceName = task.description;

    if (!serviceName) {
      return;
    }

    if (!taskMap[serviceName]) {
      taskMap[serviceName] = {
        name: serviceName,
        count: 0,
        amount: 0
      };
    }

    taskMap[serviceName].count += 1;
    taskMap[serviceName].amount += task.laborPrice || 0;
  });

  const sortedServices = Object.values(taskMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

  const maxCount = sortedServices[0]?.count || 1;

  const icons = [
    'pi pi-cog',
    'pi pi-wrench',
    'pi pi-bolt'
  ];

  return sortedServices.map((service, index) => ({
    ...service,
    progress: Math.round((service.count / maxCount) * 100),
    icon: icons[index % icons.length]
  }));
});

/**
 * Datos de ingresos semanales.
 */
const weeklyIncomeData = computed(() => {
  const labels = [];
  const data = [];

  let totalWeek = 0;

  for (let i = 5; i >= 0; i -= 1) {
    const currentDate = new Date();

    currentDate.setDate(currentDate.getDate() - i);

    labels.push(
        currentDate
            .toLocaleDateString(locale.value, {
              weekday: 'short'
            })
            .replace('.', '')
            .toUpperCase()
    );

    const dateString =
        currentDate.toISOString().split('T')[0];

    const dayTotal = workOrderStore.workOrders
        .filter((order) => order.startDate === dateString)
        .reduce(
            (sum, order) =>
                sum + (parseFloat(order.price) || 0),
            0
        );

    data.push(dayTotal);
    totalWeek += dayTotal;
  }

  return {
    total: totalWeek,
    chartData: {
      labels,
      datasets: [
        {
          label: t('dashboard.charts.weeklyIncomeLabel'),
          data,
          backgroundColor: [
            '#dbeafe',
            '#bfdbfe',
            '#dbeafe',
            '#bfdbfe',
            '#0b1680',
            '#e5e7eb'
          ],
          borderRadius: 12
        }
      ]
    }
  };
});

/**
 * Configuración del gráfico de barras.
 */
const barChartOptions = ref({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) =>
            `${t('common.currencyPrefix')} ${context.raw}`
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#64748b',
        font: {
          weight: 'bold'
        }
      }
    },
    y: {
      grid: {
        color: '#eef2f7',
        borderDash: [5, 5]
      },
      border: {
        display: false
      }
    }
  }
});

/**
 * Últimas órdenes registradas.
 */
const recentOrders = computed(() =>
    [...workOrderStore.workOrders]
        .reverse()
        .slice(0, 5)
);
</script>

<template>
  <section class="admin-dashboard">
    <DashboardHeader
        @create-order="router.push('/work-orders/new')"
        @view-orders="router.push('/work-orders')"
    />

    <div class="kpi-grid">
      <DashboardMetricCard
          :title="t('dashboard.metrics.activeVehicles')"
          :value="vehiclesInWorkshop"
          :subtitle="t('dashboard.metrics.activeVehiclesSub')"
          icon="pi pi-car"
          color="blue"
      />

      <DashboardMetricCard
          :title="t('dashboard.metrics.activeOrders')"
          :value="activeOrdersCount"
          :subtitle="t('dashboard.metrics.activeOrdersSub')"
          icon="pi pi-file-edit"
          color="indigo"
      />

      <DashboardMetricCard
          :title="t('dashboard.metrics.completed')"
          :value="completedOrdersCount"
          :subtitle="t('dashboard.metrics.completedSub')"
          icon="pi pi-check-circle"
          color="green"
      />

      <DashboardMetricCard
          :title="t('dashboard.metrics.projectedRevenue')"
          :value="`${t('common.currencyPrefix')} ${projectedIncome}`"
          :subtitle="t('dashboard.metrics.projectedRevenueSub')"
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
          :weeklyIncome="weeklyIncomeData.total"
          :chartData="weeklyIncomeData.chartData"
          :chartOptions="barChartOptions"
      />

      <RecentOrdersPanel
          :orders="recentOrders"
          @view-orders="router.push('/work-orders')"
      />

      <FrequentServicesPanel
          :services="frequentServices"
      />
    </div>
  </section>
</template>

<style scoped>
.admin-dashboard {
  min-height: 100%;
  padding-bottom: 2rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 1.5rem;
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