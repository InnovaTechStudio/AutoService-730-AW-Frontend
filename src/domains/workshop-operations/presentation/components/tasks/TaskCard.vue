<script setup>
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const { t } = useI18n();

defineProps({
  task: {
    type: Object,
    required: true
  }
});

defineEmits([
  'delete',
  'go-order',
  'review'
]);

const hasMaterials = (task) => {
  return task?.raw?.parts && task.raw.parts.length > 0;
};
</script>

<template>
  <article class="task-card">
    <div
        v-if="task.photo"
        class="image-wrapper"
    >
      <img
          :src="task.photo"
          :alt="t('tasks.card.imageAlt')"
          class="task-image"
      />
    </div>

    <div class="task-content">
      <div class="task-top">
        <div class="task-title-group">
          <Tag
              :value="task.workOrderCode"
              severity="secondary"
              rounded
          />
          <h3>{{ task.description }}</h3>
        </div>
        <Tag
            :value="$t(`taskStatus.${task.status.toLowerCase()}`)"
            :severity="task.severity"
            rounded
        />
      </div>

      <div class="task-meta">
        <span>
          <i class="pi pi-user"></i>
          {{ task.mechanicName }}
        </span>
        <span>
          <i class="pi pi-clock"></i>
          {{ task.estimatedTime }}h
        </span>
        <span v-if="task.priority">
          <i class="pi pi-flag"></i>
          {{ $t(`priorities.${task.priority.toLowerCase()}`) }}
        </span>
      </div>

      <div class="approval-flow">
        <div v-if="task.raw?.adminReviewStatus === 'Enviado al Administrador'" class="flow-badge flow-badge--warning">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ t('tasks.card.reviewRequired') }}</span>
          <Button :label="t('tasks.actions.review')" icon="pi pi-search" size="small" severity="warning" outlined @click.stop="$emit('review', task.raw)" />
        </div>
        <div v-else-if="task.raw?.adminReviewStatus === 'Aprobado'" class="flow-badge flow-badge--success">
          <i class="pi pi-check-circle"></i>
          <span>{{ t('tasks.card.approvedVisible') }}</span>
        </div>
        <div v-else-if="task.status === 'En Proceso' || task.status === 'IN_PROGRESS'" class="flow-badge flow-badge--progress">
          <i class="pi pi-cog"></i>
          <span>{{ t('tasks.card.activeWork') }}</span>
        </div>
      </div>

      <div v-if="hasMaterials(task)" class="materials-box">
        <h4><i class="pi pi-box"></i> Materiales Utilizados</h4>
        <div class="materials-list">
          <div v-for="(part, index) in task.raw.parts" :key="index" class="material-item">
            <span>{{ part.quantity }}x {{ part.name }}</span>
            <strong>S/ {{ ((part.unitPrice || 0) * part.quantity).toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <Button
            v-tooltip.top="t('tasks.actions.viewOrder')"
            icon="pi pi-external-link"
            text
            rounded
            @click.stop="$emit('go-order', task.workOrderId)"
        />
        <Button
            v-tooltip.top="t('actions.delete')"
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click.stop="$emit('delete', task)"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.task-card { display: flex; gap: 1.25rem; padding: 1.25rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: box-shadow 0.2s ease, transform 0.2s ease; }
.task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
.image-wrapper { width: 80px; flex-shrink: 0; }
.task-image { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; }
.task-content { display: flex; flex: 1; flex-direction: column; gap: 0.75rem; min-width: 0; }
.task-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.task-title-group { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
.task-title-group h3 { margin: 0; overflow: hidden; font-size: 1.1rem; font-weight: 700; line-height: 1.4; color: #1e293b; text-overflow: ellipsis; white-space: nowrap; }
.task-meta { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.9rem; color: #64748b; }
.task-meta span { display: inline-flex; align-items: center; gap: 0.4rem; }
.approval-flow { display: flex; align-items: center; }
.flow-badge { display: inline-flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.85rem; font-weight: 600; border-radius: 10px; }
.flow-badge i { flex-shrink: 0; font-size: 1rem; }
.flow-badge span { flex: 1; }
.flow-badge--warning { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; }
.flow-badge--success { color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; }
.flow-badge--progress { color: #1e40af; background: #eff6ff; border: 1px solid #bfdbfe; }

.materials-box { background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px dashed #cbd5e1; margin-top: 0.25rem; }
.materials-box h4 { margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 0.4rem; font-weight: 800; text-transform: uppercase; }
.materials-list { display: flex; flex-direction: column; gap: 0.5rem; }
.material-item { display: flex; justify-content: space-between; font-size: 0.95rem; color: #1e293b; background: white; padding: 0.5rem 0.85rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.material-item strong { color: #0b1680; }

.task-actions { display: flex; justify-content: flex-end; gap: 0.25rem; padding-top: 0.5rem; margin-top: auto; border-top: 1px solid #f1f5f9; }
</style>