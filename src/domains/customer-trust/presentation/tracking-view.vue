<template>
  <div class="tracking-layout">
    <div class="tracking-header">
      <div class="icon-circle">
        <i class="pi pi-car"></i>
      </div>
      <h1>Rastrea tu Vehículo</h1>
      <p>Ingresa el código de servicio que te proporcionó el taller para monitorear el progreso en tiempo real.</p>
    </div>

    <div class="tracking-content">
      <!-- Search Card Section -->
      <div class="card search-box">
        <label for="code" class="search-label">Código de Servicio</label>
        <div class="search-input-wrapper">
          <InputText
              id="code"
              v-model="trackingCode"
              placeholder="Ej: AS-1001A"
              @keyup.enter="searchOrder"
              class="code-input"
          />
        </div>
        <div class="btn-container">
          <Button icon="pi pi-search" label="Buscar Servicio" @click="searchOrder" :loading="isLoading" class="search-btn p-button-primary" />
        </div>
        
        <div v-if="errorMsg" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ errorMsg }}
        </div>
      </div>

      <!-- Results Card Section -->
      <div v-if="orderData" class="card results-box fade-in">
        
        <!-- Vehicle Details Section -->
        <div class="vehicle-card">
          <div class="vehicle-image-container">
            <!-- Renders the custom Base64 image or the synced Unsplash fallback -->
            <img v-if="vehicleData?.image" :src="vehicleData.image" alt="Vehicle" class="vehicle-img" />
            <div v-else class="vehicle-placeholder">
              <i class="pi pi-car"></i>
            </div>
          </div>
          
          <div class="vehicle-details">
            <span class="vehicle-subtitle">VEHÍCULO EN TALLER</span>
            <h2 class="vehicle-title">{{ vehicleData?.brand }} {{ vehicleData?.model }}</h2>
            <div class="vehicle-badges">
              <span class="badge plate-badge"><i class="pi pi-id-card"></i> {{ vehicleData?.plate }}</span>
              <Tag :value="orderData.status" :severity="getStatusSeverity(orderData.status)" class="status-badge" />
            </div>
          </div>
        </div>

        <!-- Dates Section -->
        <div class="dates-container">
          <div class="date-box">
            <span class="date-label">FECHA DE INGRESO</span>
            <span class="date-value"><i class="pi pi-calendar-plus text-primary"></i> {{ orderData.startDate }}</span>
          </div>
          <div class="date-divider"></div>
          <div class="date-box">
            <span class="date-label">ENTREGA ESTIMADA</span>
            <span class="date-value"><i class="pi pi-calendar-clock text-primary"></i> {{ orderData.estimatedDate }}</span>
          </div>
        </div>

        <!-- Timeline Section -->
        <div class="timeline-container">
          <h3 class="timeline-title">Progreso del Servicio</h3>
          <Timeline :value="tasks" class="custom-timeline">
            <template #marker="slotProps">
              <span class="custom-marker" :class="getTaskMarkerColor(slotProps.item.status)">
                <i :class="getTaskIcon(slotProps.item.status)"></i>
              </span>
            </template>
            <template #content="slotProps">
              <div class="timeline-content" :class="{'active-content': slotProps.item.status === 'En Proceso'}">
                <h4 class="task-title">{{ slotProps.item.description }}</h4>
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

    // Logic to sync the exact same Unsplash fallback image used in the "Vehicles" module if no custom photo exists
    if (!vehicleData.value.image) {
      try {
        const vehiclesResp = await fetch('http://localhost:3000/vehicles');
        const allVehicles = await vehiclesResp.json();
        const index = allVehicles.findIndex(v => v.id === order.vehicleId);
        
        const fallbackImages = [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop'
        ];
        
        if (index !== -1) {
          vehicleData.value.image = fallbackImages[index % fallbackImages.length];
        }
      } catch (e) {
        console.error("Failed to fetch default fallback image:", e);
      }
    }

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
  if (status === 'En Proceso') return 'marker-info pulse';
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Fix for PrimeIcons: Do not apply font-family globally using the asterisk selector */
* {
  box-sizing: border-box;
}

.tracking-layout {
  min-height: 100vh;
  width: 100vw;
  /* Elegant dark background inspired by modern automotive dashboards */
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #f8fafc;
}

.tracking-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.icon-circle i {
  font-size: 2.5rem;
  color: #60a5fa; /* Azul claro para contraste */
}

.tracking-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}

.tracking-header p {
  font-size: 1rem;
  max-width: 450px;
  margin: 0 auto;
  opacity: 0.8;
  line-height: 1.5;
  color: #cbd5e1;
}

.tracking-content {
  width: 100%;
  max-width: 650px;
}

/* Card Styles - Dark Mode */
.card {
  background: #1e293b;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* Search Box Centered */
.search-box {
  text-align: center;
}

.search-label {
  display: block;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.search-input-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.code-input {
  width: 100%;
  max-width: 350px;
  font-size: 1.2rem;
  padding: 1rem;
  text-align: center;
  border-radius: 12px;
  background: #0f172a;
  border: 2px solid #334155;
  font-weight: 600;
  letter-spacing: 2px;
  color: #f8fafc;
  transition: all 0.3s;
}

.code-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.2);
}

.btn-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

:deep(.search-btn) {
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 10px;
  background-color: #10b981 !important;
  border-color: #10b981 !important;
  color: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

:deep(.search-btn:hover) {
  background-color: #059669 !important;
  border-color: #059669 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.error-message {
  color: #fca5a5;
  background-color: rgba(220, 38, 38, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(248, 113, 113, 0.2);
}

/* Vehicle Card - Responsive Dark */
.vehicle-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #334155;
}

@media (min-width: 500px) {
  .vehicle-card {
    flex-direction: row;
    align-items: center;
  }
}

.vehicle-image-container {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  border: 2px solid #334155;
  background: #0f172a;
  margin: 0 auto; 
}

@media (min-width: 500px) {
  .vehicle-image-container {
    margin: 0; 
  }
}

.vehicle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vehicle-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: #475569;
}

.vehicle-details {
  flex-grow: 1;
  text-align: center; 
}

@media (min-width: 500px) {
  .vehicle-details {
    text-align: left; 
  }
}

.vehicle-subtitle {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1.5px;
}

.vehicle-title {
  margin: 0.3rem 0 0.8rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #f8fafc;
}

.vehicle-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
}

@media (min-width: 500px) {
  .vehicle-badges {
    justify-content: flex-start;
  }
}

.plate-badge {
  background: #334155;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  color: #f1f5f9;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #475569;
}

/* Dates Dark */
.dates-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2.5rem;
  border: 1px solid #334155;
}

.date-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.date-box:last-child {
  text-align: right;
}

.date-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.date-value {
  font-size: 1.15rem;
  font-weight: 600;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-divider {
  width: 1px;
  height: 40px;
  background: #334155;
}

.text-primary {
  color: #60a5fa;
}

/* Timeline Styles - Dark Mode */
.timeline-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f8fafc;
  padding-left: 0.8rem;
  border-left: 4px solid #3b82f6;
}

.custom-marker {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  font-size: 1rem;
}

.marker-success { background: #10b981; }
.marker-info { background: #3b82f6; }
.marker-pending { background: #334155; color: #94a3b8; box-shadow: none; border: 1px solid #475569; }

.timeline-content {
  padding-bottom: 2rem;
  margin-left: 0.5rem;
}

.task-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.15rem;
  font-weight: 500;
  color: #cbd5e1;
}

.active-content .task-title {
  color: #60a5fa;
  font-weight: 600;
}

.task-tag {
  font-size: 0.85rem;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.p-timeline-event-separator) {
  margin-top: 4px;
}

/* Timeline connecting line adapted for dark background */
:deep(.p-timeline-event-connector) {
  background-color: #334155 !important;
}

.pulse {
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
</style>