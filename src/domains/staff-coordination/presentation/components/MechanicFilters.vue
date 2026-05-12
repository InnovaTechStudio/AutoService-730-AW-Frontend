<script setup>
/**
 * @file MechanicFilters.vue
 * @description
 * Filter component used in the mechanics view.
 * Allows users to search mechanics and filter them by specialty.
 */
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
/**
 * Internationalization instance.
 * Provides access to application translations.
 */
const { t } = useI18n();
/**
 * Component props definition.
 *
 * @typedef {Object} Props
 * @property {string} search Current mechanic search text.
 * @property {string|null} specialty Currently selected specialty filter.
 * @property {Array} specialtyOptions Available specialty dropdown options.
 */
defineProps({ search: String, specialty: [String, null], specialtyOptions: Array });
defineEmits(['update:search', 'update:specialty']);
</script>

<template>
  <div class="mechanic-filters">
    <span class="p-input-icon-left search-box">
      <i class="pi pi-search"></i>
      <InputText :model-value="search" :placeholder="t('mechanics.filters.searchPlaceholder')" @update:model-value="$emit('update:search', $event)" />
    </span>
    <Dropdown :model-value="specialty" :options="specialtyOptions" :placeholder="t('mechanics.filters.specialtyPlaceholder')" show-clear class="specialty-filter" @update:model-value="$emit('update:specialty', $event)" />
  </div>
</template>

<style scoped>
.mechanic-filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 280px; }
.search-box :deep(.p-inputtext) { width: 100%; border-radius: 16px; }
.specialty-filter { min-width: 240px; }
</style>