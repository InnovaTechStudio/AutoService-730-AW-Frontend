<script setup>
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps({ order: Object });
defineEmits(['view-detail']);
</script>

<template>
  <article class="order-card" :class="{ 'risk-card': order.isRisk }">
    <div class="order-header">
      <div class="order-code">
        <span class="code">{{ order.trackingCode }}</span>
        <Tag v-if="order.isRisk" :value="t('workOrders.card.riskBadge')" severity="danger" rounded />
      </div>
      <Tag :value="order.status" :severity="order.severity" rounded />
    </div>

    <div class="order-vehicle">
      <i class="pi pi-car"></i>
      <strong>{{ order.vehiclePlate }}</strong>
    </div>

    <p class="order-customer"><i class="pi pi-user"></i> {{ order.customerName }}</p>

    <div class="order-dates">
      <div>
        <span>{{ t('workOrders.card.arrival') }}</span>
        <strong>{{ order.startDate }}</strong>
      </div>
      <div>
        <span>{{ t('workOrders.card.delivery') }}</span>
        <strong>{{ order.estimatedDate }}</strong>
      </div>
      <div>
        <span>Total</span>
        <strong>S/. {{ order.price }}</strong>
      </div>
    </div>

    <div class="order-progress-row">
      <span>{{ t('workOrders.card.taskProgress') }}</span>
      <strong>{{ order.progress }}%</strong>
    </div>
    <ProgressBar :value="order.progress" :showValue="false" class="order-progress" />

    <Button
        :label="t('workOrders.card.viewDetail')"
        icon="pi pi-arrow-right"
        icon-pos="right"
        outlined
        class="detail-button"
        @click="$emit('view-detail', order)"
    />
  </article>
</template>

<style scoped>
.order-card { padding: 1.2rem; border: 1px solid #e8edf5; border-radius: 24px; background: #ffffff; box-shadow: 0 12px 28px rgba(15,23,42,0.06); display: flex; flex-direction: column; gap: 0.9rem; }
.risk-card { border-color: #fca5a5; background: #fff9f9; }
.order-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.order-code { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.code { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.order-vehicle { display: flex; align-items: center; gap: 0.6rem; font-size: 1rem; color: #0f172a; }
.order-vehicle i { color: #0b1680; }
.order-customer { margin: 0; display: flex; align-items: center; gap: 0.5rem; color: #64748b; }
.order-dates { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.8rem; }
.order-dates div { padding: 0.7rem; border-radius: 14px; background: #f8fafc; }
.order-dates span { display: block; color: #64748b; font-size: 0.82rem; font-weight: 700; }
.order-dates strong { display: block; margin-top: 0.2rem; color: #0f172a; font-size: 0.95rem; }
.order-progress-row { display: flex; justify-content: space-between; color: #64748b; font-weight: 700; }
.order-progress-row strong { color: #0b1680; }
.order-progress { height: 8px; }
.detail-button { width: 100%; border-radius: 14px; }
</style>