<script setup>
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  search: String,
  status: [String, null],
  statusOptions: Array
});

defineEmits(['update:search', 'update:status']);
</script>

<template>
  <div class="vehicle-filters">
    <span class="p-input-icon-left search-box">
      <i class="pi pi-search"></i>
      <InputText
          :model-value="search"
          :placeholder="t('vehicles.filters.searchPlaceholder')"
          @update:model-value="$emit('update:search', $event)"
      />
    </span>

    <Dropdown
        :model-value="status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        :placeholder="t('vehicles.filters.statusPlaceholder')"
        show-clear
        class="status-filter"
        @update:model-value="$emit('update:status', $event)"
    />
  </div>
</template>

<style scoped>
.vehicle-filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 280px; }
.search-box :deep(.p-inputtext) { width: 100%; border-radius: 16px; }
.status-filter { min-width: 220px; }
</style>