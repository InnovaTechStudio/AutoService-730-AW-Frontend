<template>
  <div class="tracking-layout">

    <div class="tracking-header">
      <i class="pi pi-car header-icon"></i>
      <h1>Rastrea tu Vehículo</h1>
      <p>Ingresa el código que te proporcionó el taller para ver el estado de tu servicio en tiempo real.</p>
    </div>

    <div class="tracking-content">

      <div class="search-box">
        <label for="code">Código de Servicio</label>
        <div class="p-inputgroup">
          <InputText
              id="code"
              v-model="trackingCode"
              placeholder="Ej: AS-1001A"
              @keyup.enter="searchOrder"
              class="code-input"
          />
          <Button icon="pi pi-search" label="Buscar" @click="searchOrder" :loading="isLoading" class="p-button-primary" />
        </div>
        <div v-if="errorMsg" class="error-message mt-3">
          <i class="pi pi-exclamation-circle"></i> {{ errorMsg }}
        </div>
      </div>

      <div v-if="orderData" class="results-box fade-in">

        <div class="vehicle-info">
          <div class="vehicle-header">
            <div class="vehicle-details">
              <span class="label">Vehículo Ingresado</span>
              <h2>{{ vehicleData?.brand }} {{ vehicleData?.model }} <span>{{ vehicleData?.plate }}</span></h2>
            </div>
            <Tag :value="orderData.status" :severity="getStatusSeverity(orderData.status)" class="status-tag" />
          </div>

          <div class="dates-grid">
            <div class="date-item">
              <span class="label">Fecha de Ingreso</span>
              <strong><i class="pi pi-calendar-plus text-blue-500"></i> {{ orderData.startDate }}</strong>
            </div>
            <div class="date-item right-align">
              <span class="label">Entrega Estimada</span>
              <strong><i class="pi pi-calendar text-orange-500"></i> {{ orderData.estimatedDate }}</strong>
            </div>
          </div>
        </div>

        <div class="timeline-section">
          <h3>Progreso del Servicio</h3>
          <Timeline :value="tasks" class="custom-timeline">
            <template #marker="slotProps">
              <span class="custom-marker" :class="getTaskMarkerColor(slotProps.item.status)">
                <i :class="getTaskIcon(slotProps.item.status)"></i>
              </span>
            </template>
            <template #content="slotProps">
              <div class="timeline-content">
                <h4>{{ slotProps.item.description }}</h4>
                <Tag :value="slotProps.item.status" :severity="getTaskTagSeverity(slotProps.item.status)" class="task-tag" />
              </div>
            </template>
          </Timeline>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { TrackingService } from '../infrastructure/tracking.service';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';

const trackingCode = ref('');
const isLoading = ref(false);
const errorMsg = ref('');

const orderData = ref(null);
const vehicleData = ref(null);
const tasks = ref([]);

const searchOrder = async () => {
  if (!trackingCode.value) return;

  isLoading.value = true;
  errorMsg.value = '';
  orderData.value = null;

  try {

    const orders = await TrackingService.getOrderByCode(trackingCode.value.trim().toUpperCase());

    if (!orders || orders.length === 0) {
      errorMsg.value = 'El código ingresado no existe o es incorrecto.';
      return;
    }

    const order = orders[0];
    orderData.value = order;


    vehicleData.value = await TrackingService.getVehicle(order.vehicleId);


    tasks.value = await TrackingService.getTasks(order.id);

  } catch (error) {
    errorMsg.value = 'Problemas al conectar con el servidor. Verifica tu conexión.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};


const getStatusSeverity = (status) => {
  if (status === 'Finalizado') return 'success';
  if (status === 'En Proceso') return 'info';
  return 'warning';
};

const getTaskMarkerColor = (status) => {
  if (status === 'Completada') return 'marker-success';
  if (status === 'En Proceso') return 'marker-info';
  return 'marker-pending';
};

const getTaskIcon = (status) => {
  if (status === 'Completada') return 'pi pi-check';
  if (status === 'En Proceso') return 'pi pi-cog pi-spin';
  return 'pi pi-circle-fill';
};

const getTaskTagSeverity = (status) => {
  if (status === 'Completada') return 'success';
  if (status === 'En Proceso') return 'info';
  return 'secondary';
};
</script>

<style scoped>

* {
  box-sizing: border-box;
}

.tracking-layout {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 4rem 1rem;
}

.tracking-header {
  text-align: center;
  color: white;
  margin-bottom: 2.5rem;
}

.header-icon {
  font-size: 3.5rem;
  color: #93c5fd;
  margin-bottom: 1rem;
}

.tracking-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.tracking-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 500px;
  margin: 0 auto;
}

.tracking-content {
  width: 100%;
  max-width: 600px;
}


.search-box, .results-box {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.search-box label {
  display: block;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.code-input {
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  letter-spacing: 1px;
}

.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #fecaca;
}


.vehicle-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.vehicle-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.3rem;
}

.vehicle-details h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.vehicle-details span {
  font-weight: normal;
  color: #64748b;
}

.status-tag {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.dates-grid {
  display: flex;
  padding: 1rem 1.5rem;
}

.date-item {
  flex: 1;
}

.date-item strong {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #334155;
}

.right-align {
  text-align: right;
}

.right-align strong {
  justify-content: flex-end;
}


.timeline-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.timeline-content {
  margin-left: 0.5rem;
  padding-bottom: 1.5rem;
}

.timeline-content h4 {
  margin: 0 0 0.5rem 0;
  color: #334155;
  font-size: 1.1rem;
}

.task-tag {
  font-size: 0.75rem;
}


.custom-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.marker-success { background-color: #10b981; }
.marker-info { background-color: #3b82f6; }
.marker-pending { background-color: #cbd5e1; color: #475569; }

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.p-timeline-event-separator) {
  margin-top: 4px;
}
</style>