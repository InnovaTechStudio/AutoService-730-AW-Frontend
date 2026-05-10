<script setup>
import Card from 'primevue/card';

defineProps({
  title: String,
  value: [String, Number],
  subtitle: String,
  icon: String,
  color: {
    type: String,
    default: 'blue'
  }
});
</script>


<template>
  <Card :class="['metric-card', `metric-card--${color}`]">
    <template #content>
      <div class="metric-content">
        <div>
          <span>{{ title }}</span>
          <strong>{{ value }}</strong>
          <small>{{ subtitle }}</small>
        </div>
        <i :class="icon"></i>
      </div>
    </template>
  </Card>
</template>



<style scoped>
.metric-card {
  border-radius: 22px;
  border: 1px solid #e8edf5;
  overflow: hidden;
}

.metric-card :deep(.p-card-body),
.metric-card :deep(.p-card-content) {
  padding: 0;
}

.metric-content {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  min-height: 132px;
  padding: 1.25rem;
  border-left: 6px solid transparent;
}

.metric-content span {
  display: block;
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 700;
}

.metric-content strong {
  display: block;
  margin: 0.35rem 0 0.25rem;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1;
}

.metric-content small {
  color: #94a3b8;
}

.metric-content i {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  font-size: 1.3rem;
}

.metric-card--blue .metric-content { border-left-color: #2563eb; }
.metric-card--blue i { color: #2563eb; background: #dbeafe; }

.metric-card--indigo .metric-content { border-left-color: #0b1680; }
.metric-card--indigo i { color: #0b1680; background: #e0e7ff; }

.metric-card--green .metric-content { border-left-color: #16a34a; }
.metric-card--green i { color: #16a34a; background: #dcfce7; }

.metric-card--violet .metric-content { border-left-color: #7c3aed; }
.metric-card--violet i { color: #7c3aed; background: #ede9fe; }
</style>