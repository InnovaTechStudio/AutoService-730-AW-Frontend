<script setup>
/**
 * @file tracking-view.vue
 * @description **Vehicle Tracking View (Public Customer Page)**
 *
 * Public page that allows customers to track the status of their vehicle service
 * by entering a tracking code. Displays real-time order information, tasks,
 * visual evidence, estimated costs, and provides payment options.
 *
 * Part of the **Customer Trust** domain - Presentation Layer.
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { TrackingService } from '../infrastructure/tracking.service';
import PaymentModal from "./payment-modal.vue";
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';
import LanguageSwitcher from '../../../shared/presentation/language-switcher.vue';

const { t } = useI18n();

const trackingCode = ref('');
const isLoading = ref(false);
const errorMsg = ref('');

const orderData = ref(null);
const vehicleData = ref(null);
const tasks = ref([]);
const vehicleHistory = ref([]);
const selectedTask = ref(null);
const showPaymentModal = ref(false);

/**
 * Searches for an order using the tracking code.
 */
const searchOrder = async () => {
  if (!trackingCode.value) return;

  isLoading.value = true;
  errorMsg.value = '';
  orderData.value = null;

  try {
    const orders = await TrackingService.getOrderByCode(trackingCode.value.trim().toUpperCase());

    if (!orders || orders.length === 0) {
      errorMsg.value = t('tracking.invalidCode');
      return;
    }

    const order = orders[0];
    orderData.value = order;

    vehicleData.value = await TrackingService.getVehicle(order.vehicleId);
    vehicleHistory.value = await TrackingService.getVehicleHistory(vehicleData.value.plate);
    tasks.value = await TrackingService.getTasks(order.id);

    selectedTask.value = tasks.value.find(task => task.photo) || tasks.value[0];

  } catch (error) {
    errorMsg.value = t('tracking.connectionError');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// NUEVO: Función para descargar el PDF
const downloadPDF = () => {
  window.print();
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

<template>
  <div class="tracking-layout">

    <div class="tracking-header no-print">
      <div class="language-switcher-container">
        <LanguageSwitcher />
      </div>
      <i class="pi pi-car header-icon"></i>
      <h1>{{ t('tracking.title') }}</h1>
      <p>{{ t('tracking.description') }}</p>
    </div>

    <div class="tracking-content">
      <div class="search-box no-print">
        <label for="code">{{ t('tracking.serviceCode') }}</label>
        <div class="p-inputgroup">
          <InputText
              id="code"
              v-model="trackingCode"
              :placeholder="t('tracking.placeholder')"
              @keyup.enter="searchOrder"
              class="code-input"
          />
          <Button icon="pi pi-search" :label="t('tracking.search')" @click="searchOrder" :loading="isLoading" class="p-button-primary" />
        </div>
        <div v-if="errorMsg" class="error-message mt-3">
          <i class="pi pi-exclamation-circle"></i> {{ errorMsg }}
        </div>
      </div>

      <div v-if="orderData" class="results-box fade-in no-print">

        <div class="vehicle-info">
          <div class="vehicle-header">
            <div class="vehicle-details">
              <span class="label">{{ t('tracking.vehicleEntered') }}</span>
              <h2>{{ vehicleData?.brand }} {{ vehicleData?.model }} <span>{{ vehicleData?.plate }}</span></h2>
            </div>

            <div class="header-actions">
              <Tag :value="orderData.status" :severity="getStatusSeverity(orderData.status)" class="status-tag" />
              <Button
                  icon="pi pi-file-pdf"
                  label="Descargar PDF"
                  severity="info"
                  outlined
                  @click="downloadPDF"
              />
            </div>
          </div>

          <div class="dates-grid">
            <div class="date-item">
              <span class="label">{{ t('tracking.entryDate') }}</span>
              <strong><i class="pi pi-calendar-plus text-blue-500"></i> {{ orderData.startDate }}</strong>
            </div>
            <div class="date-item right-align">
              <span class="label">{{ t('tracking.estimatedDelivery') }}</span>
              <strong><i class="pi pi-calendar text-orange-500"></i> {{ orderData.estimatedDate }}</strong>
            </div>
          </div>

          <div class="dashboard-grid" style="padding: 0 1.5rem 1.5rem 1.5rem;">

            <div class="left-section">

              <div class="service-card">
                <div class="card-header">
                  <h3>{{ t('tracking.serviceTasks') }}</h3>
                </div>

                <div
                    v-for="task in tasks"
                    :key="task.id"
                    class="task-item"
                    :class="{ active: selectedTask?.id === task.id }"
                    @click="selectedTask = task"
                >

                  <div class="task-left">
                    <div class="task-icon">
                      <i :class="getTaskIcon(task.status)"></i>
                    </div>

                    <div>
                      <strong>{{ task.description }}</strong>
                      <p>{{ task.status }}</p>
                    </div>
                  </div>

                  <Tag
                      :value="task.status"
                      :severity="getTaskTagSeverity(task.status)"
                  />
                </div>
              </div>

              <div class="evidence-card">

                <img
                    v-if="selectedTask?.photo"
                    :src="selectedTask.photo"
                    alt="evidence"
                />

                <div v-else class="no-image">
                  <i class="pi pi-image"></i>
                  <p>{{ t('tracking.noEvidence') }}</p>
                </div>

                <div class="evidence-info">
                  <span>{{ t('tracking.visualEvidence') }}</span>
                  <strong>{{ selectedTask?.description }}</strong>
                </div>

              </div>
              <div class="customer-report-card">
                <div class="card-header">
                  <h3>Informe del Mecánico para el Cliente</h3>
                  <p>Resumen técnico explicado en lenguaje simple.</p>
                </div>

                <div v-if="tasks.some(task => task.customerExplanation)" class="customer-report-list">
                  <div
                      v-for="task in tasks.filter(task => task.customerExplanation)"
                      :key="task.id"
                      class="customer-report-item"
                  >
                    <Tag :value="task.status" :severity="getTaskTagSeverity(task.status)" />
                    <h4>{{ task.description }}</h4>
                    <p>{{ task.customerExplanation }}</p>

                    <div v-if="task.evidenceRegistered" class="evidence-note">
                      <i class="pi pi-camera"></i>
                      {{ task.evidenceRegistered }}
                    </div>
                  </div>
                </div>

                <div v-else class="empty-mini">
                  <i class="pi pi-info-circle"></i>
                  <p>Aún no hay informe visible del mecánico para el cliente.</p>
                </div>
              </div>

              <div class="history-card">
                <div class="card-header">
                  <h3>Historial técnico del vehículo</h3>
                  <p>Registro asociado a la placa {{ vehicleData?.plate }}.</p>
                </div>

                <div v-if="vehicleHistory.length" class="history-list">
                  <div
                      v-for="record in vehicleHistory"
                      :key="record.id"
                      class="history-item"
                  >
                    <div class="history-date">
                      <i class="pi pi-calendar"></i>
                      {{ record.serviceDate }}
                    </div>

                    <h4>{{ record.serviceTitle }}</h4>
                    <p>{{ record.customerSummary }}</p>

                    <div class="history-meta">
                      <span><i class="pi pi-building"></i>{{ record.workshopName }}</span>
                      <span><i class="pi pi-user"></i>{{ record.mechanicName }}</span>
                      <span><i class="pi pi-check-circle"></i>{{ record.tasksCompleted }} tareas</span>
                    </div>

                    <div class="recommendation">
                      <strong>Recomendación:</strong>
                      {{ record.recommendation }}
                    </div>
                  </div>
                </div>

                <div v-else class="empty-mini">
                  <i class="pi pi-folder-open"></i>
                  <p>No hay historial técnico previo para este vehículo.</p>
                </div>
              </div>
            </div>

            <div class="right-section">

              <div class="cost-card">
                <span class="mini-title">
                  {{ t('tracking.estimatedCost') }}
                </span>
                <h2>${{ orderData.price }}</h2>
                <p>{{ t('tracking.costDisclaimer') }}</p>
                <Button
                    :label="t('tracking.payNow')"
                    icon="pi pi-credit-card"
                    class="pay-now-btn"
                    @click="showPaymentModal = true"
                />
              </div>

              <div class="dates-card">
                <span class="mini-title">
                  {{ t('tracking.serviceTimes') }}
                </span>
                <div class="date-box">
                  <i class="pi pi-calendar"></i>
                  <div>
                    <small>{{ t('tracking.entryDate') }}</small>
                    <strong>{{ orderData.startDate }}</strong>
                  </div>
                </div>
                <div class="date-box">
                  <i class="pi pi-clock"></i>
                  <div>
                    <small>{{ t('tracking.estimatedDelivery') }}</small>
                    <strong>{{ orderData.estimatedDate }}</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <PaymentModal
          v-model:visible="showPaymentModal"
          :amount="orderData?.price || 0"
      />
    </div>

    <div class="a4-document print-only" v-if="orderData">
      <div class="doc-header">
        <div class="doc-brand">
          <h2>AutoService</h2>
          <span>Red de Talleres Especializados</span>
        </div>
        <div class="doc-meta">
          <h1>Reporte de Servicio</h1>
          <p><strong>Placa:</strong> {{ vehicleData?.plate }}</p>
          <p><strong>Fecha de Emisión:</strong> {{ new Date().toLocaleDateString() }}</p>
          <p><strong>Código de Rastreo:</strong> {{ orderData.id }}</p>
        </div>
      </div>

      <div class="doc-body">
        <div class="print-section">
          <h3>Datos del Vehículo</h3>
          <p><strong>Marca y Modelo:</strong> {{ vehicleData?.brand }} {{ vehicleData?.model }}</p>
          <p><strong>Estado Actual del Servicio:</strong> {{ orderData.status }}</p>
          <p><strong>Fecha de Ingreso:</strong> {{ orderData.startDate }}</p>
          <p><strong>Entrega Estimada:</strong> {{ orderData.estimatedDate }}</p>
        </div>

        <div class="print-section">
          <h3>Resumen de Tareas Realizadas</h3>
          <table class="print-table">
            <thead>
            <tr>
              <th>Tarea</th>
              <th>Estado</th>
              <th>Detalle del Mecánico</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>{{ task.description }}</td>
              <td>{{ task.status }}</td>
              <td>{{ task.customerExplanation || 'Sin detalles adicionales' }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="print-section" v-if="vehicleHistory.length">
          <h3>Historial Técnico Registrado</h3>
          <ul>
            <li v-for="record in vehicleHistory" :key="record.id">
              <strong>{{ record.serviceDate }}</strong> - {{ record.serviceTitle }} (Mecánico: {{ record.mechanicName }})
              <br><em>Recomendación dejada:</em> {{ record.recommendation }}
            </li>
          </ul>
        </div>

        <div class="print-footer">
          <h2>Costo Estimado: ${{ orderData.price }}</h2>
          <p>Este documento es un resumen informativo generado por el sistema de AutoService y no representa un comprobante de pago con validez fiscal.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.pay-now-btn{
  width:100%;
  margin-top:1.5rem;
}
.tracking-layout {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 4rem 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Oculta la plantilla del PDF en pantalla normal */
.print-only {
  display: none;
}

.tracking-header {
  position: relative;
  text-align: center;
  color: white;
  margin-bottom: 2.5rem;
}

.language-switcher-container {
  position: absolute;
  top: -2rem;
  right: 0;
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
  width: 95%;
  max-width: 1600px;
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
  width: 100%;
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

.dashboard-grid{
  display:grid;
  grid-template-columns: 3fr 1.2fr;
  gap:2rem;
  margin-top:1.5rem;
  align-items:start;
}
.left-section{
  display:grid;
  grid-template-columns: 1.2fr 1fr;
  gap:1.5rem;
  align-items:start;
}

.customer-report-card,
.history-card {
  margin-top: 1.5rem;
  background: white;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.customer-report-list,
.history-list {
  display: grid;
  gap: 1rem;
}

.customer-report-item,
.history-item {
  padding: 1rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.customer-report-item h4,
.history-item h4 {
  margin: 0.7rem 0 0.4rem;
  color: #0f172a;
}

.customer-report-item p,
.history-item p {
  color: #64748b;
  line-height: 1.6;
}

.evidence-note {
  margin-top: 0.8rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: #ecfdf5;
  color: #047857;
  font-weight: 600;
}

.history-date {
  color: #0b1680;
  font-weight: 800;
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.8rem;
  color: #64748b;
}

.history-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.recommendation {
  margin-top: 0.9rem;
  padding: 0.8rem;
  border-radius: 12px;
  background: #eef2ff;
  color: #334155;
}

.empty-mini {
  display: grid;
  place-items: center;
  min-height: 140px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
}

@media(max-width:1200px){
  .left-section{
    grid-template-columns:1fr;
  }
}

.service-card,
.evidence-card,
.cost-card,
.dates-card{
  background:white;
  border-radius:18px;
  padding:1.5rem;
  box-shadow:0 10px 30px rgba(0,0,0,0.08);
}

.card-header{
  margin-bottom:1rem;
}

.card-header h3{
  margin:0;
  color:#1e293b;
}

.task-item{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:1rem;
  border-radius:14px;
  background:#f8fafc;
  margin-bottom:1rem;
  cursor:pointer;
  transition:0.2s;
  border:2px solid transparent;
}

.task-item:hover{
  transform:translateY(-2px);
}

.task-item.active{
  border-color:#3b82f6;
  background:#eff6ff;
}

.task-left{
  display:flex;
  align-items:center;
  gap:1rem;
}

.task-icon{
  width:42px;
  height:42px;
  border-radius:12px;
  background:#dbeafe;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#2563eb;
}

.task-left p{
  margin:0.3rem 0 0;
  color:#64748b;
  font-size:0.9rem;
}

.evidence-card img{
  width:100%;
  height:260px;
  object-fit:cover;
  border-radius:14px;
}

.evidence-info{
  margin-top:1rem;
}

.evidence-info span{
  font-size:0.75rem;
  color:#64748b;
  font-weight:600;
}

.evidence-info strong{
  display:block;
  margin-top:0.4rem;
  color:#0f172a;
}

.cost-card h2{
  font-size:2.3rem;
  margin:1rem 0;
  color:#111827;
}

.mini-title{
  font-size:0.8rem;
  color:#64748b;
  font-weight:700;
  letter-spacing:1px;
}

.date-box{
  display:flex;
  gap:1rem;
  margin-top:1.5rem;
  align-items:center;
}

.date-box i{
  width:42px;
  height:42px;
  border-radius:12px;
  background:#dbeafe;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#2563eb;
}

.date-box small{
  display:block;
  color:#64748b;
  margin-bottom:0.3rem;
}

.no-image{
  height:260px;
  border-radius:14px;
  background:#f1f5f9;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  color:#64748b;
}

@media(max-width:1200px){
  .dashboard-grid{
    grid-template-columns:1fr;
  }
}
</style>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  /* Ocultamos absolutamente toda la página web... */
  body * {
    visibility: hidden;
  }

  /* Quitamos fondos negros que tengas aplicados al body o html */
  html, body, #app, .tracking-layout {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 100% !important;
  }

  /* ...Y hacemos visible ÚNICAMENTE nuestra plantilla A4 oculta */
  .a4-document, .a4-document * {
    visibility: visible;
  }

  /* Posicionamos la hoja A4 exactamente en la esquina superior */
  .a4-document {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20mm;
    display: block !important;
    color: black;
  }

  /* Todo lo que tenga la clase no-print no saldrá (botones, input, headers oscuros) */
  .no-print {
    display: none !important;
  }

  /* Diseño interno del PDF */
  .doc-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  .doc-brand h2 { margin: 0; color: #2563eb; font-size: 24px; }
  .doc-brand span { font-size: 12px; color: #64748b; }

  .doc-meta h1 { margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase; }
  .doc-meta p { margin: 2px 0; font-size: 14px; }

  .print-section { margin-bottom: 2rem; }
  .print-section h3 { border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px; font-size: 16px; color: #1e293b;}

  .print-section p, .print-section li { font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 5px; }

  .print-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
  .print-table th, .print-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
  .print-table th { background-color: #f8fafc; font-weight: bold; }

  .print-footer { margin-top: 3rem; text-align: right; border-top: 2px solid #2563eb; padding-top: 1rem; }
  .print-footer h2 { margin: 0 0 10px 0; font-size: 20px;}
  .print-footer p { font-size: 11px; color: #64748b; }
}
</style>