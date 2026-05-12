<script setup>
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps({ vehicle: Object });
defineEmits(['edit','view-detail']);
</script>

<template>
  <article class="vehicle-card">
    <img :src="vehicle.image" :alt="vehicle.name" class="vehicle-image" />

    <div class="vehicle-content">
      <div class="vehicle-header">
        <div>
          <h3>{{ vehicle.name }}</h3>
          <p>{{ vehicle.owner }}</p>
        </div>
        <Button icon="pi pi-pencil" rounded text severity="secondary" @click="$emit('edit', vehicle.raw)" />
      </div>

      <div class="vehicle-meta">
        <span><i class="pi pi-id-card"></i>{{ vehicle.plate }}</span>
        <span><i class="pi pi-calendar"></i>{{ vehicle.year }}</span>
        <span><i class="pi pi-palette"></i>{{ vehicle.color }}</span>
      </div>

      <div class="vehicle-status">
        <Tag :value="vehicle.status" :severity="vehicle.severity" rounded />
        <strong>{{ vehicle.progress }}%</strong>
      </div>

      <ProgressBar :value="vehicle.progress" :showValue="false" class="vehicle-progress" />

      <Button :label="t('vehicles.card.viewDetails')" icon="pi pi-arrow-right" icon-pos="right" outlined class="details-button" @click="$emit('view-detail', vehicle.raw)"/>
    </div>
  </article>
</template>

<style scoped>
.vehicle-card { display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 1rem; border: 1px solid #e8edf5; border-radius: 24px; background: #ffffff; box-shadow: 0 12px 28px rgba(15,23,42,0.06); }
.vehicle-image { width: 100%; height: 145px; border-radius: 18px; object-fit: cover; background: #e2e8f0; }
.vehicle-content { min-width: 0; }
.vehicle-header { display: flex; justify-content: space-between; gap: 1rem; }
.vehicle-header h3 { margin: 0; color: #0f172a; font-size: 1.15rem; }
.vehicle-header p { margin: 0.25rem 0 0; color: #64748b; }
.vehicle-meta { display: flex; flex-wrap: wrap; gap: 0.8rem; margin: 1rem 0; color: #64748b; font-size: 0.92rem; }
.vehicle-meta span { display: inline-flex; align-items: center; gap: 0.4rem; }
.vehicle-meta i { color: #0b1680; }
.vehicle-status { display: flex; justify-content: space-between; align-items: center; }
.vehicle-status strong { color: #0b1680; }
.vehicle-progress { height: 8px; margin: 0.8rem 0 1rem; }
.details-button { width: 100%; border-radius: 14px; }
@media (max-width: 720px) { .vehicle-card { grid-template-columns: 1fr; } .vehicle-image { height: 190px; } }
</style>