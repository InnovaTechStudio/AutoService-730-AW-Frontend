<script setup>
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

defineProps({
  search: String,
  status: [String, null],
  mechanicId: [String, Number, null],
  statusOptions: Array,
  mechanicOptions: Array
});

defineEmits(['update:search', 'update:status', 'update:mechanicId']);
</script>

<template>
  <div class="task-filters">
    <span class="p-input-icon-left search-box">
      <i class="pi pi-search"></i>
      <InputText
          :model-value="search"
          placeholder="Buscar por descripción, orden o mecánico..."
          @update:model-value="$emit('update:search', $event)"
      />
    </span>

    <Dropdown
        :model-value="status"
        :options="statusOptions"
        placeholder="Estado"
        show-clear
        class="filter-select"
        @update:model-value="$emit('update:status', $event)"
    />

    <Dropdown
        :model-value="mechanicId"
        :options="mechanicOptions"
        option-label="fullName"
        option-value="id"
        placeholder="Mecánico"
        show-clear
        filter
        class="filter-select"
        @update:model-value="$emit('update:mechanicId', $event)"
    />
  </div>
</template>

<style scoped>
.task-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  min-width: 280px;
}

.search-box :deep(.p-inputtext) {
  width: 100%;
  border-radius: 16px;
}

.filter-select {
  min-width: 210px;
}
</style>