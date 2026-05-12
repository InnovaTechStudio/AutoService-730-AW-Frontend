<script setup>
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';

defineProps({
  order: Object
});

defineEmits(['view-detail']);
</script>

<template>
  <article class="work-order-card">
    <div class="order-top">
      <div>
        <span class="order-code">{{ order.trackingCode }}</span>
        <h3>{{ order.vehiclePlate }}</h3>
        <p>{{ order.customerName }}</p>
      </div>

      <Tag :value="order.status" :severity="order.severity" rounded />
    </div>

    <div class="order-meta">
      <span><i class="pi pi-calendar"></i>Ingreso: {{ order.startDate || '---' }}</span>
      <span><i class="pi pi-clock"></i>Entrega: {{ order.estimatedDate || '---' }}</span>
      <span><i class="pi pi-wallet"></i>S/. {{ order.price || 0 }}</span>
    </div>

    <div class="progress-area">
      <div class="progress-label">
        <span>Progreso de tareas</span>
        <strong>{{ order.progress }}%</strong>
      </div>
      <ProgressBar :value="order.progress" :showValue="false" class="order-progress" />
    </div>

    <div class="order-footer">
      <div :class="['delay-badge', `delay-badge--${order.riskLevel}`]">
        <i :class="order.riskIcon"></i>
        {{ order.riskLabel }}
      </div>

      <Button
          label="Ver detalle"
          icon="pi pi-arrow-right"
          icon-pos="right"
          outlined
          class="detail-button"
          @click="$emit('view-detail', order.raw)"
      />
    </div>
  </article>
</template>

<style scoped>
.work-order-card {
  padding: 1.2rem;
  border: 1px solid #e8edf5;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.order-code {
  display: inline-flex;
  margin-bottom: 0.45rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #0b1680;
  font-size: 0.78rem;
  font-weight: 800;
}

h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
}

p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 1rem 0;
  color: #64748b;
  font-size: 0.92rem;
}

.order-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.order-meta i {
  color: #0b1680;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-weight: 700;
}

.progress-label strong {
  color: #0b1680;
}

.order-progress {
  height: 8px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-top: 1.2rem;
}

.delay-badge {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
}

.delay-badge--on-track {
  background: #ecfdf5;
  color: #047857;
}

.delay-badge--at-risk {
  background: #fff7ed;
  color: #c2410c;
}

.delay-badge--delayed {
  background: #fef2f2;
  color: #b91c1c;
}

.delay-badge--completed {
  background: #eef2ff;
  color: #0b1680;
}

.detail-button {
  border-radius: 14px;
}

@media (max-width: 720px) {
  .order-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-button {
    width: 100%;
  }
}
</style>