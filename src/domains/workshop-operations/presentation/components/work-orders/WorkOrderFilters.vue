<script setup>
/**
 * @file WorkOrderFilters.vue
 * @description Filters component for work orders listing.
 */

import { useI18n } from 'vue-i18n';

import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

const { t } = useI18n();

defineProps({
  search: {
    type: String,
    default: ''
  },

  status: {
    type: [String, null],
    default: null
  },

  statusOptions: {
    type: Array,
    default: () => []
  }
});

defineEmits([
  'update:search',
  'update:status'
]);
</script>

<template>
  <div class="order-filters">
    <div class="search-box">
      <i class="pi pi-search search-icon"></i>

      <InputText
          :model-value="search"
          :placeholder="
          t('workOrders.filters.searchPlaceholder')
        "
          @update:model-value="
          $emit('update:search', $event)
        "
      />
    </div>

    <Select
        :model-value="status"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="
        t('workOrders.filters.statusPlaceholder')
      "
        showClear
        class="status-filter"
        @update:model-value="
        $emit('update:status', $event)
      "
    />
  </div>
</template>

<style scoped>
.order-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  z-index: 10;
  color: #9ca3af;
  pointer-events: none;
}

.search-box :deep(.p-inputtext) {
  width: 100%;
  padding-left: 2.8rem;
  border-radius: 16px;
}

.status-filter {
  min-width: 220px;
  border-radius: 16px;
}
</style>