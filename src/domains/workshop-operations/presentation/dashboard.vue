<template>
  <section class="admin-dashboard">
    <div class="dashboard-header">
      <div>
        <span class="eyebrow">Panel operativo</span>
        <h1>Dashboard del Taller</h1>
        <p>
          Supervisa vehículos activos, órdenes en proceso, ingresos y rendimiento semanal desde una sola vista.
        </p>
      </div>

      <div class="header-actions">
        <Button
            label="Nueva orden"
            icon="pi pi-plus"
            class="primary-action"
            @click="router.push('/work-orders/new')"
        />
        <Button
            label="Ver órdenes"
            icon="pi pi-list"
            outlined
            @click="router.push('/work-orders')"
        />
      </div>
    </div>

    <div class="kpi-grid">
      <Card class="metric-card metric-card--blue">
        <template #content>
          <div class="metric-content">
            <div>
              <span>Vehículos activos</span>
              <strong>{{ vehiclesInWorkshop }}</strong>
              <small>En atención actualmente</small>
            </div>
            <i class="pi pi-car"></i>
          </div>
        </template>
      </Card>

      <Card class="metric-card metric-card--indigo">
        <template #content>
          <div class="metric-content">
            <div>
              <span>Órdenes activas</span>
              <strong>{{ activeOrders }}</strong>
              <small>Servicios en proceso</small>
            </div>
            <i class="pi pi-file-edit"></i>
          </div>
        </template>
      </Card>

      <Card class="metric-card metric-card--green">
        <template #content>
          <div class="metric-content">
            <div>
              <span>Completados</span>
              <strong>{{ completedOrders }}</strong>
              <small>Órdenes finalizadas</small>
            </div>
            <i class="pi pi-check-circle"></i>
          </div>
        </template>
      </Card>

      <Card class="metric-card metric-card--violet">
        <template #content>
          <div class="metric-content">
            <div>
              <span>Ingresos proyectados</span>
              <strong>S/. {{ projectedIncome }}</strong>
              <small>Según órdenes activas</small>
            </div>
            <i class="pi pi-wallet"></i>
          </div>
        </template>
      </Card>
    </div>

    <div class="dashboard-grid">
      <Card class="panel-card active-vehicles-card">
        <template #content>
          <div class="panel-heading">
            <div>
              <h2>Vehículos activos</h2>
              <p>Prioriza servicios según estado y avance.</p>
            </div>
            <Button
                label="Ver todos"
                text
                size="small"
                @click="router.push('/vehicles')"
            />
          </div>

          <div class="vehicle-list">
            <div
                v-for="vehicle in activeVehiclePreview"
                :key="vehicle.id"
                class="vehicle-item"
            >
              <img :src="vehicle.image" :alt="vehicle.name" class="vehicle-image" />

              <div class="vehicle-info">
                <div class="vehicle-top">
                  <div>
                    <h3>{{ vehicle.name }}</h3>
                    <Tag
                        :value="vehicle.status"
                        :severity="getVehicleSeverity(vehicle.status)"
                        rounded
                    />
                  </div>
                  <strong>{{ vehicle.progress }}%</strong>
                </div>

                <ProgressBar
                    :value="vehicle.progress"
                    :showValue="false"
                    class="vehicle-progress"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="panel-card income-card">
        <template #content>
          <div class="panel-heading">
            <div>
              <h2>Ingresos semanales</h2>
              <p>Total acumulado esta semana.</p>
            </div>
            <strong class="income-total">S/. {{ weeklyIncome }}</strong>
          </div>

          <Chart
              type="bar"
              :data="weeklyIncomeData"
              :options="barChartOptions"
              class="income-chart"
          />

          <div class="comparison-box">
            <i class="pi pi-arrow-up-right"></i>
            <div>
              <strong>+12.5% vs semana pasada</strong>
              <span>Mejor rendimiento por servicios completados</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="panel-card orders-card">
        <template #content>
          <div class="panel-heading">
            <div>
              <h2>Actividad reciente</h2>
              <p>Últimas órdenes registradas.</p>
            </div>
            <Button
                icon="pi pi-arrow-right"
                rounded
                text
                @click="router.push('/work-orders')"
            />
          </div>

          <DataTable
              :value="recentOrders"
              class="p-datatable-sm clean-table"
              responsiveLayout="scroll"
          >
            <Column field="trackingCode" header="Código"></Column>

            <Column field="status" header="Estado">
              <template #body="slotProps">
                <Tag
                    :value="slotProps.data.status"
                    :severity="getOrderSeverity(slotProps.data.status)"
                    rounded
                />
              </template>
            </Column>

            <Column header="Monto">
              <template #body="slotProps">
                S/. {{ slotProps.data.price || 0 }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card class="panel-card services-card">
        <template #content>
          <div class="panel-heading">
            <div>
              <h2>Servicios frecuentes</h2>
              <p>Servicios con mayor demanda.</p>
            </div>
          </div>

          <div class="service-list">
            <div
                v-for="service in frequentServices"
                :key="service.name"
                class="service-item"
            >
              <div class="service-icon">
                <i :class="service.icon"></i>
              </div>

              <div class="service-info">
                <div class="service-top">
                  <strong>{{ service.name }}</strong>
                  <span>S/. {{ service.amount }}</span>
                </div>
                <small>{{ service.count }} servicios realizados</small>
                <ProgressBar
                    :value="service.progress"
                    :showValue="false"
                    class="service-progress"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';

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

const pendingTasks = computed(() =>
    taskStore.tasks.filter((task) => task.status !== 'Completada').length
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
        progress: getProgressByStatus(vehicle.status),
        image: vehicle.image || fallbackVehicleImages[index % fallbackVehicleImages.length]
      }));
});

const frequentServices = ref([
  {
    name: 'Cambio de aceite',
    count: 12,
    amount: 540,
    progress: 86,
    icon: 'pi pi-cog'
  },
  {
    name: 'Reparación de frenos',
    count: 8,
    amount: 820,
    progress: 68,
    icon: 'pi pi-wrench'
  },
  {
    name: 'Rotación de neumáticos',
    count: 5,
    amount: 140,
    progress: 44,
    icon: 'pi pi-refresh'
  }
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
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#64748b'
      }
    },
    y: {
      grid: {
        color: '#eef2f7'
      },
      ticks: {
        display: false
      },
      border: {
        display: false
      }
    }
  }
});

const getProgressByStatus = (status) => {
  if (status === 'Completado' || status === 'Finalizado' || status === 'Listo') return 100;
  if (status === 'En Proceso' || status === 'En Taller') return 65;
  if (status === 'Pendiente') return 10;
  return 35;
};

const getVehicleSeverity = (status) => {
  if (status === 'Completado' || status === 'Finalizado' || status === 'Listo') return 'success';
  if (status === 'En Proceso' || status === 'En Taller') return 'info';
  if (status === 'Pendiente') return 'warning';
  return 'secondary';
};

const getOrderSeverity = (status) => {
  if (status === 'Finalizado' || status === 'Completado') return 'success';
  if (status === 'En Proceso') return 'info';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Cancelado') return 'danger';
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

<style scoped>
.admin-dashboard {
  min-height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
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

.dashboard-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.dashboard-header p {
  max-width: 680px;
  margin: 0.75rem 0 0;
  color: #64748b;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.primary-action {
  background: #0b1680;
  border-color: #0b1680;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.metric-card {
  border-radius: 22px;
  border: 1px solid #e8edf5;
  overflow: hidden;
}

.metric-card :deep(.p-card-body),
.metric-card :deep(.p-card-content) {
  padding: 0;
}

.metric-content {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  min-height: 132px;
  padding: 1.25rem;
  border-left: 6px solid transparent;
}

.metric-content span {
  display: block;
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 700;
}

.metric-content strong {
  display: block;
  margin: 0.35rem 0 0.25rem;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1;
}

.metric-content small {
  color: #94a3b8;
}

.metric-content i {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  font-size: 1.3rem;
}

.metric-card--blue .metric-content {
  border-left-color: #2563eb;
}

.metric-card--blue i {
  color: #2563eb;
  background: #dbeafe;
}

.metric-card--indigo .metric-content {
  border-left-color: #0b1680;
}

.metric-card--indigo i {
  color: #0b1680;
  background: #e0e7ff;
}

.metric-card--green .metric-content {
  border-left-color: #16a34a;
}

.metric-card--green i {
  color: #16a34a;
  background: #dcfce7;
}

.metric-card--violet .metric-content {
  border-left-color: #7c3aed;
}

.metric-card--violet i {
  color: #7c3aed;
  background: #ede9fe;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 1.25rem;
}

.panel-card {
  border-radius: 24px;
  border: 1px solid #e8edf5;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
}

.panel-card :deep(.p-card-body),
.panel-card :deep(.p-card-content) {
  height: 100%;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.panel-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.28rem;
}

.panel-heading p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.vehicle-list,
.service-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vehicle-item,
.service-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid #edf2f7;
  border-radius: 18px;
  background: #f8fafc;
}

.vehicle-image {
  width: 74px;
  height: 58px;
  border-radius: 14px;
  object-fit: cover;
  background: #e2e8f0;
}

.vehicle-info,
.service-info {
  flex: 1;
  min-width: 0;
}

.vehicle-top,
.service-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.vehicle-top h3 {
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-size: 1rem;
}

.vehicle-top strong,
.service-top span {
  color: #0b1680;
  font-weight: 800;
}

.vehicle-progress,
.service-progress {
  height: 8px;
  margin-top: 0.75rem;
}

.income-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.income-total {
  color: #0b1680;
  font-size: 1.4rem;
}

.income-chart {
  height: 250px;
}

.comparison-box {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 18px;
  background: #f0fdf4;
  color: #166534;
}

.comparison-box i {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #dcfce7;
}

.comparison-box strong,
.comparison-box span {
  display: block;
}

.comparison-box span {
  margin-top: 0.15rem;
  color: #4b5563;
  font-size: 0.9rem;
}

.orders-card,
.services-card {
  min-height: 340px;
}

.service-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  color: #0b1680;
  background: #eef2ff;
  flex: 0 0 auto;
}

.service-top strong {
  color: #0f172a;
}

.clean-table {
  overflow: hidden;
  border-radius: 16px;
}

.clean-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #475569;
  font-size: 0.82rem;
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
  .dashboard-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .p-button {
    flex: 1;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .vehicle-item,
  .service-item {
    align-items: flex-start;
  }
}
</style>