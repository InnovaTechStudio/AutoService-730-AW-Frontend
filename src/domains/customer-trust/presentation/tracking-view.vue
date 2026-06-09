<script setup>
/**
 * @file tracking.page.vue (parte 1)
 * @description **Tracking Page Logic**
 *
 * Handles searching orders by tracking code, fetching vehicle data,
 * tasks, and history. Also manages payment flow and progress calculation.
 */
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TrackingService } from '../infrastructure/tracking.service';
import PaymentModal from "./payment-modal.vue";
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import LanguageSwitcher from '../../../shared/presentation/language-switcher.vue';

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

/** Standardized administrative review workflow statuses */
const REVIEW_STATUS = {
  APPROVED: 'APPROVED'
};

const { t } = useI18n();

const trackingCode = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const orderData = ref(null);
const vehicleData = ref(null);
const tasks = ref([]);
const vehicleHistory = ref([]);
const showPaymentModal = ref(false);
const isProcessingUpdate = ref(false);

/**
 * Busca una orden por código de tracking y carga datos relacionados.
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

  } catch (error) {
    errorMsg.value = t('tracking.connectionError');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Maneja el éxito de un pago y actualiza la orden.
 */
const onPaymentSuccess = async () => {
  isProcessingUpdate.value = true;
  try {
    await TrackingService.processPayment(orderData.value.id);
    await searchOrder();
  } catch (error) {
    console.error(error);
  } finally {
    isProcessingUpdate.value = false;
  }
};

/**
 * Descarga/Imprime el estado actual en PDF.
 */
const downloadPDF = () => window.print();

/**
 * Determina el estilo visual del estado basado en constantes.
 * @param {string} status - Estado de la orden
 * @returns {string} PrimeVue severity
 */
const getStatusSeverity = (status) => {
  if (status === ORDER_STATUS.FINISHED || status === ORDER_STATUS.DELIVERED) return 'success';
  if (status === ORDER_STATUS.IN_PROGRESS) return 'info';
  return 'warning';
};

/**
 * Mapea el código técnico del estado a su etiqueta i18n legible.
 * @param {string} status - Código de estado en mayúsculas
 * @returns {string} Etiqueta traducida
 */
const getStatusLabel = (status) => {
  const key = String(status).toLowerCase();
  return t(`tracking.states.${key}`);
};

/**
 * Lista de tareas aprobadas por el administrador utilizando código estándar.
 */
const approvedTasks = computed(() => {
  return tasks.value.filter(task => task.adminReviewStatus === REVIEW_STATUS.APPROVED);
});

/**
 * Calcula el progreso de tareas completadas utilizando código estándar.
 */
const calculateProgress = computed(() => {
  if (!tasks.value.length) return 10;
  const completed = tasks.value.filter(task => task.status === TASK_STATUS.COMPLETED).length;
  return Math.round((completed / tasks.value.length) * 100);
});

/**
 * Texto dinámico de progreso (i18n).
 */
const progressText = computed(() => {
  const p = calculateProgress.value;
  if (p === 100) return t('tracking.detail.vehicleReady');
  if (p > 50) return t('tracking.progress.finalPhase');
  if (p > 0) return t('tracking.progress.inProgress');
  return t('tracking.progress.pendingDiagnosis');
});
</script>

<template>
  <div class="tracking-layout">

    <div class="hero-bg no-print">
      <div class="language-switcher-container">
        <LanguageSwitcher />
      </div>
      <div class="hero-content">
        <i class="pi pi-compass hero-icon"></i>
        <h1>{{ t('tracking.title') }}</h1>
        <p>{{ t('tracking.description') }}</p>

        <div class="search-box">
          <div class="p-inputgroup search-group">
            <InputText
                id="code"
                v-model="trackingCode"
                :placeholder="t('tracking.placeholder')"
                @keyup.enter="searchOrder"
                class="code-input"
            />
            <Button
                icon="pi pi-search"
                :label="t('tracking.search')"
                @click="searchOrder"
                :loading="isLoading"
                class="search-btn"
            />
          </div>
          <div v-if="errorMsg" class="error-message">
            <i class="pi pi-exclamation-circle"></i> {{ errorMsg }}
          </div>
        </div>
      </div>
    </div>

    <div class="tracking-content" v-if="orderData">
      <div class="status-overview-card fade-in no-print">
        <div class="overview-header">
          <div class="vehicle-identity">
            <span class="plate-badge">{{ vehicleData?.plate }}</span>
            <h2>{{ vehicleData?.brand }} {{ vehicleData?.model }}</h2>
          </div>
          <div class="overview-actions">
            <Tag :value="getStatusLabel(orderData.status)" :severity="getStatusSeverity(orderData.status)" class="main-status-tag" />
            <Button
                icon="pi pi-print"
                severity="secondary"
                outlined
                rounded
                @click="downloadPDF"
                :label="t('tracking.print')"
            />
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-labels">
            <span class="progress-text">{{ progressText }}</span>
            <strong class="progress-pct">{{ calculateProgress }}%</strong>
          </div>
          <div class="tracking-progress-container">
            <ProgressBar :value="calculateProgress" :showValue="false" class="tracking-progress" />
          </div>
        </div>
      </div>

      <div class="tracking-grid fade-in no-print">

        <div class="left-column">
          <div class="report-card">
            <div class="card-header">
              <i class="pi pi-verified icon-header"></i>
              <div>
                <h3>{{ t('tracking.serviceReport.title') }}</h3>
                <p>{{ t('tracking.serviceReport.subtitle') }}</p>
              </div>
            </div>

            <div v-if="approvedTasks.length > 0" class="approved-list">
              <div v-for="task in approvedTasks" :key="task.id" class="approved-item">
                <div class="item-header">
                  <i class="pi pi-check-circle text-green-500"></i>
                  <h4>{{ task.description }}</h4>
                </div>
                <p class="customer-explanation" v-if="task.customerExplanation">
                  {{ task.customerExplanation }}
                </p>
                <div v-if="task.evidenceRegistered" class="evidence-link">
                  <i class="pi pi-camera"></i>
                  <a :href="task.evidenceRegistered" target="_blank">{{ t('tracking.serviceReport.viewEvidence') }}</a>
                </div>
              </div>
            </div>

            <div v-else class="empty-report">
              <i class="pi pi-shield"></i>
              <p>{{ t('tracking.serviceReport.empty') }}</p>
            </div>
          </div>

          <div class="history-card" v-if="vehicleHistory.length > 0">
            <div class="card-header">
              <i class="pi pi-history icon-header"></i>
              <div>
                <h3>{{ t('tracking.history.title') }}</h3>
                <p>{{ t('tracking.history.subtitle') }}</p>
              </div>
            </div>
            <div class="history-list">
              <div v-for="record in vehicleHistory" :key="record.id" class="history-item">
                <div class="history-date">{{ record.serviceDate }}</div>
                <div class="history-details">
                  <h4>{{ record.serviceTitle }}</h4>
                  <p>{{ record.customerSummary }}</p>
                  <div class="recommendation" v-if="record.recommendation">
                    <strong>{{ t('tracking.history.recommendation') }}:</strong> {{ record.recommendation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="checkout-card">
            <h3>{{ t('tracking.billing.title') }}</h3>

            <div class="checkout-dates">
              <div class="date-row">
                <span><i class="pi pi-calendar-plus"></i> {{ t('tracking.billing.entryDate') }}</span>
                <strong>{{ orderData.startDate }}</strong>
              </div>
              <div class="date-row">
                <span><i class="pi pi-calendar-clock"></i> {{ t('tracking.billing.estimatedDelivery') }}</span>
                <strong>{{ orderData.estimatedDate }}</strong>
              </div>
            </div>

            <div class="checkout-total">
              <span>{{ t('tracking.billing.total') }}</span>
              <h2>S/. {{ orderData.price }}</h2>
            </div>
            <p class="disclaimer">{{ t('tracking.costDisclaimer') }}</p>

            <Button
                :label="orderData.status === ORDER_STATUS.DELIVERED ? t('tracking.billing.paid') : t('tracking.payNow')"
                :icon="orderData.status === ORDER_STATUS.DELIVERED ? 'pi pi-check-circle' : 'pi pi-credit-card'"
                class="pay-btn"
                :disabled="orderData.status === ORDER_STATUS.DELIVERED || isProcessingUpdate"
                :severity="orderData.status === ORDER_STATUS.DELIVERED ? 'success' : 'primary'"
                @click="showPaymentModal = true"
            />
          </div>
        </div>
      </div>

      <PaymentModal
          v-model:visible="showPaymentModal"
          :amount="orderData?.price || 0"
          @success="onPaymentSuccess"
      />
    </div>

    <div class="a4-document print-only" v-if="orderData">
      <div class="doc-header">
        <div class="doc-brand">
          <h2>AutoService</h2>
          <span>{{ t('tracking.print.brandSubtitle') }}</span>
        </div>
        <div class="doc-meta">
          <h1>{{ t('tracking.print.reportTitle') }}</h1>
          <p><strong>{{ t('tracking.print.plate') }}:</strong> {{ vehicleData?.plate }}</p>
          <p><strong>{{ t('tracking.print.issueDate') }}:</strong> {{ new Date().toLocaleDateString() }}</p>
          <p><strong>{{ t('tracking.print.trackingCode') }}:</strong> {{ orderData.id }}</p>
        </div>
      </div>

      <div class="doc-body">
        <div class="print-section">
          <h3>{{ t('tracking.print.vehicleData') }}</h3>
          <p><strong>{{ t('tracking.print.brandModel') }}:</strong> {{ vehicleData?.brand }} {{ vehicleData?.model }}</p>
          <p><strong>{{ t('tracking.print.currentStatus') }}:</strong> {{ getStatusLabel(orderData.status) }}</p>
          <p><strong>{{ t('tracking.print.entryDate') }}:</strong> {{ orderData.startDate }}</p>
          <p><strong>{{ t('tracking.print.estimatedDelivery') }}:</strong> {{ orderData.estimatedDate }}</p>
        </div>

        <div class="print-section">
          <h3>{{ t('tracking.print.tasksSummary') }}</h3>
          <table class="print-table">
            <thead>
            <tr>
              <th>{{ t('tracking.print.task') }}</th>
              <th>{{ t('tracking.print.customerDetail') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="task in approvedTasks" :key="task.id">
              <td>{{ task.description }}</td>
              <td>{{ task.customerExplanation || t('tracking.print.noObservations') }}</td>
            </tr>
            <tr v-if="approvedTasks.length === 0">
              <td colspan="2" style="text-align: center;">{{ t('tracking.print.noReport') }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="print-footer">
          <h2>{{ t('tracking.print.estimatedCost') }}: S/. {{ orderData.price }}</h2>
          <p>{{ t('tracking.print.disclaimer') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.tracking-layout {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
  padding-bottom: 4rem;
}
.print-only { display: none; }

/* Hero section */
.hero-bg {
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 4rem 1rem 8rem;
  position: relative;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.language-switcher-container { position: absolute; top: 1.5rem; right: 2rem; }
.hero-content { max-width: 600px; width: 100%; z-index: 2; }
.hero-icon { font-size: 3rem; color: #38bdf8; margin-bottom: 1rem; }
.hero-content h1 { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.5rem 0; letter-spacing: -0.5px; }
.hero-content p { font-size: 1.05rem; opacity: 0.8; margin-bottom: 2rem; }

/* Search box */
.search-box {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  width: 100%;
}
.search-group { display: flex; height: 55px; width: 100%; }
.code-input {
  flex: 1;
  height: 100%;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 2px;
  border-radius: 12px 0 0 12px !important;
  border: none;
  margin: 0;
}
.search-btn {
  height: 100%;
  border-radius: 0 12px 12px 0 !important;
  font-weight: 700;
  padding: 0 2rem;
  margin: 0;
}
.error-message {
  margin-top: 1rem;
  color: #fca5a5;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Content layout */
.tracking-content {
  width: 95%;
  max-width: 1100px;
  margin-top: -4rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* Status overview */
.status-overview-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(15,23,42,0.05);
}
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.vehicle-identity h2 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
.plate-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  border: 1px solid #c7d2fe;
}
.overview-actions { display: flex; align-items: center; gap: 1rem; }
.main-status-tag { font-size: 1.1rem; padding: 0.6rem 1.2rem; }

.progress-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
.progress-labels { display: flex; justify-content: space-between; margin-bottom: 0.8rem; font-weight: 700; }
.progress-text { color: #475569; }
.progress-pct { color: #0b1680; font-size: 1.2rem; }
.tracking-progress { height: 12px; border-radius: 8px; }

/* Grid layout */
.tracking-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: start; }
.left-column { display: flex; flex-direction: column; gap: 1.5rem; }

/* Cards */
.report-card, .history-card, .checkout-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(15,23,42,0.03);
  border: 1px solid #e2e8f0;
}
.card-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; }
.icon-header { font-size: 1.8rem; color: #3b82f6; background: #eff6ff; padding: 0.8rem; border-radius: 14px; }
.card-header h3 { margin: 0 0 0.2rem 0; font-size: 1.3rem; color: #0f172a; }
.card-header p { margin: 0; color: #64748b; font-size: 0.95rem; }

/* Approved tasks */
.approved-list { display: flex; flex-direction: column; gap: 1rem; }
.approved-item {
  padding: 1.5rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: 0.2s;
}
.approved-item:hover { border-color: #cbd5e1; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
.item-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; }
.item-header h4 { margin: 0; font-size: 1.1rem; color: #1e293b; }
.customer-explanation { margin: 0; color: #475569; line-height: 1.6; }
.evidence-link {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #f0fdf4;
  color: #166534;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
}
.evidence-link a { color: #166534; text-decoration: none; }
.evidence-link a:hover { text-decoration: underline; }

.empty-report {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
}
.empty-report i { font-size: 2.5rem; margin-bottom: 1rem; color: #94a3b8; }

/* History */
.history-list { display: flex; flex-direction: column; gap: 1.5rem; position: relative; }
.history-list::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #e2e8f0;
}
.history-item { position: relative; padding-left: 2.5rem; }
.history-date {
  display: inline-block;
  background: #eef2ff;
  color: #4f46e5;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  position: relative;
}
.history-date::before {
  content: '';
  position: absolute;
  left: -2.3rem;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4f46e5;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #eef2ff;
}
.history-details h4 { margin: 0 0 0.3rem 0; color: #0f172a; }
.history-details p { margin: 0; color: #64748b; font-size: 0.95rem; line-height: 1.5; }
.recommendation {
  margin-top: 0.8rem;
  padding: 0.8rem;
  background: #fffbeb;
  color: #92400e;
  border-radius: 10px;
  font-size: 0.9rem;
  border: 1px solid #fef3c7;
}

/* Checkout */
.checkout-card { position: sticky; top: 2rem; }
.checkout-card h3 { margin: 0 0 1.5rem 0; font-size: 1.3rem; color: #0f172a; }
.checkout-dates { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
.date-row { display: flex; justify-content: space-between; align-items: center; }
.date-row span { display: flex; align-items: center; gap: 0.5rem; color: #64748b; }
.date-row strong { color: #1e293b; }
.checkout-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 2rem 1rem;
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}
.checkout-total span { color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem; margin-bottom: 0.5rem; }
.checkout-total h2 { margin: 0; font-size: 2.8rem; color: #0b1680; letter-spacing: -1px; }
.disclaimer { text-align: center; font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.5rem; }
.pay-btn { width: 100%; padding: 1.2rem; border-radius: 14px; font-size: 1.1rem; font-weight: 700; }

/* Responsive */
@media (max-width: 1024px) {
  .tracking-grid { grid-template-columns: 1fr; }
  .checkout-card { position: relative; top: 0; }
}
@media (max-width: 640px) {
  .overview-header { flex-direction: column; align-items: center; text-align: center; }
  .hero-bg { padding: 3rem 1rem 6rem; }
}

/* Print styles (A4) */
@media print {
  @page { size: A4 portrait; margin: 0; }
  body * { visibility: hidden; }
  html, body, #app, .tracking-layout { background: white !important; padding: 0 !important; margin: 0 !important; height: 100% !important; }
  .a4-document, .a4-document * { visibility: visible; }
  .a4-document { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20mm; display: block !important; color: black; }
  .no-print { display: none !important; }
  .doc-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 2rem; }
  .doc-brand h2 { margin: 0; color: #0f172a; font-size: 24px; }
  .doc-brand span { font-size: 12px; color: #64748b; }
  .doc-meta h1 { margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase; }
  .doc-meta p { margin: 2px 0; font-size: 14px; }
  .print-section { margin-bottom: 2rem; }
  .print-section h3 { border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px; font-size: 16px; color: #1e293b; }
  .print-section p, .print-section li { font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 5px; }
  .print-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
  .print-table th, .print-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
  .print-table th { background-color: #f8fafc; font-weight: bold; }
  .print-footer { margin-top: 3rem; text-align: right; border-top: 2px solid #0f172a; padding-top: 1rem; }
  .print-footer h2 { margin: 0 0 10px 0; font-size: 20px; }
  .print-footer p { font-size: 11px; color: #64748b; }
}
</style>