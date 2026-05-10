<script setup>
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';

defineProps({
  mechanic: Object
});

defineEmits(['edit', 'delete']);
</script>

<template>
  <article class="mechanic-card">
    <div :class="['load-line', mechanic.loadClass]"></div>

    <div class="mechanic-top">
      <div class="mechanic-profile">
        <Avatar icon="pi pi-user" size="large" shape="circle" class="mechanic-avatar" />

        <div>
          <h3>{{ mechanic.fullName }}</h3>
          <p>{{ mechanic.specialty }}</p>
        </div>
      </div>

      <Tag :value="mechanic.workloadStatus" :severity="mechanic.severity" rounded />
    </div>

    <div class="mechanic-stats">
      <div>
        <span>Tareas activas</span>
        <strong>{{ mechanic.activeTasks }} / {{ mechanic.maxCapacity }}</strong>
      </div>

      <div>
        <span>Efectividad</span>
        <strong>{{ mechanic.effectiveness }}%</strong>
      </div>
    </div>

    <div class="load-section">
      <div class="load-label">
        <span>Carga laboral</span>
        <strong>{{ mechanic.loadPercentage }}%</strong>
      </div>

      <ProgressBar
          :value="mechanic.loadPercentage"
          :showValue="false"
          class="load-progress"
      />
    </div>

    <div class="mechanic-actions">
      <Button
          label="Editar"
          icon="pi pi-pencil"
          outlined
          class="action-button"
          @click="$emit('edit', mechanic.raw)"
      />

      <Button
          icon="pi pi-trash"
          severity="danger"
          outlined
          class="delete-button"
          @click="$emit('delete', mechanic.raw)"
      />
    </div>
  </article>
</template>

<style scoped>
.mechanic-card {
  position: relative;
  padding: 1.2rem;
  overflow: hidden;
  border: 1px solid #e8edf5;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.load-line {
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  width: 100%;
}

.load-low {
  background: #16a34a;
}

.load-medium {
  background: #f59e0b;
}

.load-high {
  background: #ef4444;
}

.mechanic-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.mechanic-profile {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}

.mechanic-avatar {
  background: #eef2ff;
  color: #0b1680;
}

h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
}

p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.mechanic-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  margin: 1.2rem 0;
}

.mechanic-stats div {
  padding: 0.85rem;
  border-radius: 16px;
  background: #f8fafc;
}

.mechanic-stats span {
  display: block;
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 700;
}

.mechanic-stats strong {
  display: block;
  margin-top: 0.25rem;
  color: #0b1680;
  font-size: 1.3rem;
}

.load-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-weight: 700;
}

.load-label strong {
  color: #0b1680;
}

.load-progress {
  height: 8px;
}

.mechanic-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.2rem;
}

.action-button {
  flex: 1;
  border-radius: 14px;
}

.delete-button {
  border-radius: 14px;
}
</style>