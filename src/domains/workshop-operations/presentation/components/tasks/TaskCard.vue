<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import { useI18n } from 'vue-i18n';

defineProps({
  task: Object,
  statusOptions: Array
});

defineEmits(['status-change', 'material-status-change', 'edit', 'delete', 'go-order']);

const { t } = useI18n();

const getReviewSeverity = (status) => {
  if (status === 'Enviado al Administrador') return 'info';
  return 'secondary';
};

const getCustomerSeverity = (status) => {
  if (status === 'Visible para Cliente') return 'success';
  return 'warning';
};

const formatDate = (date) => {
  if (!date) return 'Sin completar';
  return new Date(date).toLocaleString();
};
const hasMaterials = (task) => {
  return task.raw?.usedMaterials?.length > 0;
};

const getMaterialsTotal = (task) => {
  return Number(task.raw?.materialsTotal || 0).toFixed(2);
};
</script>

<template>
  <article class="task-card">
    <img
        v-if="task.photo"
        :src="task.photo"
        alt="Task"
        class="task-image"
    />

    <div class="task-top">
      <div>
        <Tag :value="task.workOrderCode" severity="secondary" rounded />

        <h3>{{ task.description }}</h3>

        <p>
          <i class="pi pi-user"></i>
          {{ task.mechanicName }}
        </p>
      </div>

      <Tag :value="task.status" :severity="task.severity" rounded />
    </div>

    <div class="task-meta">
      <span><i class="pi pi-clock"></i>{{ task.estimatedTime || t('tasks.card.estimatedHours') }}</span>
      <span><i class="pi pi-flag"></i>{{ task.priority }}</span>
    </div>

    <div class="task-status">
      <label>{{ t('tasks.card.updateStatus') }}</label>

      <Dropdown
          :model-value="task.status"
          :options="statusOptions"
          class="w-full"
          @update:model-value="$emit('status-change', task.raw, $event)"
      />
    </div>

    <div
        v-if="task.raw?.technicalDiagnosis || task.raw?.customerExplanation || task.raw?.internalObservation || task.raw?.evidenceRegistered"
        class="mechanic-report"
    >
      <Divider />

      <div class="report-header">
        <div>
          <h4>Reporte técnico del Mecánico</h4>
          <p>Información enviada para trazabilidad operativa y comunicación con el cliente.</p>
        </div>

        <div class="report-tags">
          <Tag
              :value="task.raw?.adminReviewStatus || 'Sin enviar'"
              :severity="getReviewSeverity(task.raw?.adminReviewStatus)"
              rounded
          />

          <Tag
              :value="task.raw?.customerReportStatus || 'No visible'"
              :severity="getCustomerSeverity(task.raw?.customerReportStatus)"
              rounded
          />
        </div>
      </div>

      <div class="report-grid">
        <div class="report-box">
          <span>Diagnóstico técnico</span>
          <p>{{ task.raw?.technicalDiagnosis || 'Sin diagnóstico registrado' }}</p>
        </div>

        <div class="report-box">
          <span>Explicación para cliente</span>
          <p>{{ task.raw?.customerExplanation || 'Sin explicación registrada' }}</p>
        </div>

        <div class="report-box">
          <span>Observación interna</span>
          <p>{{ task.raw?.internalObservation || 'Sin observación interna' }}</p>
        </div>

        <div class="report-box">
          <span>Evidencia simulada</span>
          <p>{{ task.raw?.evidenceRegistered || 'Sin evidencia registrada' }}</p>
        </div>
      </div>
      <div v-if="hasMaterials(task)" class="materials-admin-box">
        <div class="materials-admin-header">
          <div>
            <h4>Materiales utilizados</h4>
            <p>Materiales seleccionados por el mecánico desde el inventario.</p>
          </div>

          <div class="materials-total">
            <span>Total</span>
            <strong>S/. {{ getMaterialsTotal(task) }}</strong>
          </div>
        </div>

        <Tag
            :value="task.raw?.materialRequestStatus || 'Materiales utilizados'"
            severity="success"
            rounded
            class="material-status-tag"
        />
        <div class="material-review-actions">
          <Button
              label="Aprobar materiales"
              icon="pi pi-check"
              severity="success"
              outlined
              size="small"
              @click="$emit('material-status-change', task.raw, 'Aprobado')"
          />

          <Button
              label="Observar"
              icon="pi pi-exclamation-triangle"
              severity="warning"
              outlined
              size="small"
              @click="$emit('material-status-change', task.raw, 'En revisión')"
          />
        </div>

        <div class="materials-admin-list">
          <div
              v-for="material in task.raw.usedMaterials"
              :key="material.inventoryItemId"
              class="material-admin-item"
          >
            <div>
              <strong>{{ material.name }}</strong>
              <span>{{ material.brand }}</span>
            </div>

            <div class="material-numbers">
              <span>Cant: {{ material.quantity }}</span>
              <span>Unit: S/. {{ Number(material.unitPrice || 0).toFixed(2) }}</span>
              <strong>S/. {{ Number(material.subtotal || 0).toFixed(2) }}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="completed-row">
        <i class="pi pi-calendar-check"></i>
        <span>Completado: {{ formatDate(task.raw?.completedAt) }}</span>
      </div>
    </div>

    <div class="task-actions">
      <Button
          :label="t('tasks.card.viewOrder')"
          icon="pi pi-external-link"
          outlined
          class="action-button"
          @click="$emit('go-order', task.workOrderId)"
      />

      <Button
          icon="pi pi-pencil"
          severity="info"
          outlined
          class="icon-button"
          @click="$emit('edit', task.raw)"
      />

      <Button
          icon="pi pi-trash"
          severity="danger"
          outlined
          class="icon-button"
          @click="$emit('delete', task.raw)"
      />
    </div>
  </article>
</template>

<style scoped>
.task-card {
  padding: 1.2rem;
  border: 1px solid #e8edf5;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.task-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 18px;
  margin-bottom: 1rem;
}

.task-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

h3 {
  margin: 0.8rem 0 0.25rem;
  color: #0f172a;
  font-size: 1.15rem;
}

p {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin: 0;
  color: #64748b;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 1rem 0;
  color: #64748b;
}

.task-meta span {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.task-meta i,
p i {
  color: #0b1680;
}

.task-status label {
  display: block;
  margin-bottom: 0.45rem;
  color: #64748b;
  font-weight: 700;
}

.mechanic-report {
  margin-top: 1rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.report-header h4 {
  margin: 0;
  color: #0f172a;
}

.report-header p {
  margin-top: 0.3rem;
  color: #64748b;
  font-size: 0.9rem;
}

.report-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
}

.report-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.report-box {
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.report-box span {
  display: block;
  margin-bottom: 0.35rem;
  color: #0b1680;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.report-box p {
  display: block;
  color: #334155;
  line-height: 1.45;
}

.completed-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.9rem;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
}

.completed-row i {
  color: #16a34a;
}

.task-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.1rem;
}

.action-button {
  flex: 1;
  border-radius: 14px;
}

.icon-button {
  border-radius: 14px;
}
.materials-admin-box {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #bbf7d0;
  border-radius: 18px;
  background: #f0fdf4;
}

.materials-admin-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: .75rem;
}

.materials-admin-header h4 {
  margin: 0;
  color: #14532d;
}

.materials-admin-header p {
  display: block;
  margin-top: .3rem;
  color: #64748b;
  font-size: .9rem;
}

.materials-total {
  text-align: right;
}

.materials-total span {
  display: block;
  color: #64748b;
  font-size: .75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.materials-total strong {
  color: #0b1680;
  font-size: 1.1rem;
}

.material-status-tag {
  margin-bottom: .8rem;
}

.materials-admin-list {
  display: grid;
  gap: .65rem;
}

.material-admin-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: .75rem;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #dcfce7;
}

.material-admin-item strong,
.material-admin-item span {
  display: block;
}

.material-admin-item span {
  color: #64748b;
  font-size: .85rem;
}

.material-numbers {
  text-align: right;
}

.material-numbers strong {
  color: #0b1680;
}
.material-review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  margin: .8rem 0;
}
@media (max-width: 720px) {
  .report-header {
    flex-direction: column;
  }

  .report-tags {
    justify-content: flex-start;
  }

  .task-actions {
    flex-wrap: wrap;
  }

  .action-button {
    flex-basis: 100%;
  }
}
</style>