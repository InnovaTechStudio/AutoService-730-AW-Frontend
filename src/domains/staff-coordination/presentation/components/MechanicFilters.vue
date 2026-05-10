<script setup>
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

defineProps({
  search: String,
  specialty: [String, null],
  specialtyOptions: Array
});

defineEmits(['update:search', 'update:specialty']);
</script>

<template>
  <div class="mechanic-filters">
    <span class="p-input-icon-left search-box">
      <i class="pi pi-search"></i>
      <InputText
          :model-value="search"
          placeholder="Buscar por nombre o especialidad..."
          @update:model-value="$emit('update:search', $event)"
      />
    </span>

    <Dropdown
        :model-value="specialty"
        :options="specialtyOptions"
        placeholder="Filtrar por especialidad"
        show-clear
        class="specialty-filter"
        @update:model-value="$emit('update:specialty', $event)"
    />
  </div>
</template>

<style scoped>
.mechanic-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 280px;
}

.search-box :deep(.p-inputtext) {
  width: 100%;
  border-radius: 16px;
}

.specialty-filter {
  min-width: 240px;
}
</style>