<template>
  <Card class="panel-card">
    <template #content>
      <div class="panel-heading">
        <div>
          <h2>Vehículos activos</h2>
          <p>Prioriza servicios según estado y avance.</p>
        </div>
        <Button label="Ver todos" text size="small" @click="$emit('view-vehicles')" />
      </div>

      <div class="vehicle-list">
        <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-item">
          <img :src="vehicle.image" :alt="vehicle.name" class="vehicle-image" />

          <div class="vehicle-info">
            <div class="vehicle-top">
              <div>
                <h3>{{ vehicle.name }}</h3>
                <Tag :value="vehicle.status" :severity="vehicle.severity" rounded />
              </div>
              <strong>{{ vehicle.progress }}%</strong>
            </div>

            <ProgressBar :value="vehicle.progress" :showValue="false" class="vehicle-progress" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';

defineProps({
  vehicles: {
    type: Array,
    default: () => []
  }
});

defineEmits(['view-vehicles']);
</script>

<style scoped>
.panel-card {
  border-radius: 24px;
  border: 1px solid #e8edf5;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.28rem;
}

p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vehicle-item {
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

.vehicle-info {
  flex: 1;
}

.vehicle-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.vehicle-top h3 {
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-size: 1rem;
}

.vehicle-top strong {
  color: #0b1680;
  font-weight: 800;
}

.vehicle-progress {
  height: 8px;
  margin-top: 0.75rem;
}
</style>