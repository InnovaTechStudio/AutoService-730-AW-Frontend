<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

defineProps({
  task: Object,
  statusOptions: Array
});

defineEmits(['status-change', 'edit', 'delete', 'go-order']);
</script>

<template>
  <article class="task-card">
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
      <span><i class="pi pi-clock"></i>{{ task.estimatedTime }} h estimadas</span>
      <span><i class="pi pi-flag"></i>{{ task.priority }}</span>
    </div>

    <div class="task-status">
      <label>Actualizar estado</label>
      <Dropdown
          :model-value="task.status"
          :options="statusOptions"
          class="w-full"
          @update:model-value="$emit('status-change', task.raw, $event)"
      />
    </div>

    <div class="task-actions">
      <Button
          label="Orden"
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
</style>