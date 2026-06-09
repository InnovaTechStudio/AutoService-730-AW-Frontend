<script setup>
/**
 * Inventory management view:
 * - CRUD inventory items
 * - Filtering by SKU/name
 * - Stock status visualization
 */

import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInventoryStore } from '../application/inventory.store';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

// ── CONSTANTS FOR DOMAIN LOGIC ───────────────────────────
/** Standardized system inventory categories */
const INVENTORY_CATEGORIES = {
  SPARE_PART: 'SPARE_PART',
  OIL: 'OIL',
  SUPPLY: 'SUPPLY',
  TOOL: 'TOOL'
};

const { t } = useI18n();

const inventoryStore = useInventoryStore();

const search = ref('');
const displayDialog = ref(false);
const itemForm = ref({});

/**
 * Inventory categories mapped with dynamic structural translations
 */
const categories = computed(() => [
  { value: INVENTORY_CATEGORIES.SPARE_PART, label: t('inventory.categories.spare_part') },
  { value: INVENTORY_CATEGORIES.OIL, label: t('inventory.categories.oil') },
  { value: INVENTORY_CATEGORIES.SUPPLY, label: t('inventory.categories.supply') },
  { value: INVENTORY_CATEGORIES.TOOL, label: t('inventory.categories.tool') }
]);

onMounted(() => {
  inventoryStore.fetchItems();
});

/**
 * Filters inventory items by name or SKU.
 */
const filteredItems = computed(() => {
  const term = search.value.toLowerCase().trim();

  return inventoryStore.items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term)
  );
});

/**
 * Returns severity color based on stock level.
 */
const getStockSeverity = (item) => {
  if (item.stock === 0) return 'danger';
  if (item.stock <= item.minStock) return 'warning';
  return 'success';
};

/**
 * Resolves technical category domain value to localized interface text.
 * @param {string} categoryValue - Domain code key in uppercase
 * @returns {string} Translated category label
 */
const getCategoryLabel = (categoryValue) => {
  const key = String(categoryValue).toLowerCase();
  return t(`inventory.categories.${key}`);
};

const openNew = () => {
  itemForm.value = {
    name: '',
    category: INVENTORY_CATEGORIES.SPARE_PART,
    brand: '',
    unitPrice: 0,
    stock: 10,
    minStock: 3
  };
  displayDialog.value = true;
};

const editItem = (item) => {
  itemForm.value = { ...item };
  displayDialog.value = true;
};

const saveItem = async () => {
  if (!itemForm.value.name) return;

  if (itemForm.value.id) {
    await inventoryStore.updateItem(itemForm.value.id, itemForm.value);
  } else {
    await inventoryStore.addItem(itemForm.value);
  }

  displayDialog.value = false;
};

const deleteItem = async (item) => {
  if (confirm(`${t('inventory.deleteConfirm', { name: item.name })}`)) {
    await inventoryStore.deleteItem(item.id);
  }
};
</script>

<template>
  <section class="inventory-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">{{ t('inventory.eyebrow') }}</span>
        <h1>{{ t('inventory.title') }}</h1>
        <p>{{ t('inventory.description') }}</p>
      </div>

      <Button
          :label="t('inventory.newButton')"
          icon="pi pi-plus"
          class="add-button"
          @click="openNew"
      />
    </div>

    <div class="toolbar">
      <div class="search-box">
        <i class="pi pi-search search-icon"></i>
        <InputText
            v-model="search"
            :placeholder="t('inventory.searchPlaceholder')"
        />
      </div>
    </div>

    <div class="table-card">
      <DataTable
          :value="filteredItems"
          responsiveLayout="scroll"
          :loading="inventoryStore.loading"
          class="custom-table"
      >
        <Column field="sku" :header="t('inventory.table.sku')" style="font-weight: 700; color: #0b1680;" />

        <Column :header="t('inventory.table.item')">
          <template #body="{ data }">
            <div class="item-name">
              <strong>{{ data.name }}</strong>
              <span>{{ data.brand }}</span>
            </div>
          </template>
        </Column>

        <Column :header="t('inventory.table.category')">
          <template #body="{ data }">
            <Tag :value="getCategoryLabel(data.category)" severity="secondary" rounded />
          </template>
        </Column>

        <Column :header="t('inventory.table.stock')">
          <template #body="{ data }">
            <Tag
                :value="`${data.stock} ${t('inventory.units')}`"
                :severity="getStockSeverity(data)"
                rounded
            />
          </template>
        </Column>

        <Column :header="t('inventory.table.price')">
          <template #body="{ data }">
            <strong>S/. {{ data.unitPrice.toFixed(2) }}</strong>
          </template>
        </Column>

        <Column :header="t('inventory.table.actions')" alignFrozen="right">
          <template #body="{ data }">
            <div class="actions">
              <Button icon="pi pi-pencil" text rounded severity="info" @click="editItem(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" @click="deleteItem(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
        v-model:visible="displayDialog"
        :header="itemForm.id ? t('inventory.editTitle') : t('inventory.newTitle')"
        :modal="true"
        :style="{ width: '450px' }"
        class="p-fluid"
    >
      <div class="form-grid">
        <div class="field">
          <label>
            {{ t('inventory.form.name') }}
            <span class="required">*</span>
          </label>

          <InputText
              v-model.trim="itemForm.name"
              :placeholder="t('inventory.form.namePlaceholder')"
          />
        </div>

        <div class="row-grid">
          <div class="field">
            <label>{{ t('inventory.form.category') }}</label>
            <Select
                v-model="itemForm.category"
                :options="categories"
                optionLabel="label"
                optionValue="value"
            />
          </div>

          <div class="field">
            <label>{{ t('inventory.form.brand') }}</label>
            <InputText
                v-model.trim="itemForm.brand"
                :placeholder="t('inventory.form.brandPlaceholder')"
            />
          </div>
        </div>

        <div class="row-grid">
          <div class="field">
            <label>{{ t('inventory.form.stock') }}</label>
            <InputNumber v-model="itemForm.stock" :min="0" showButtons />
          </div>

          <div class="field">
            <label>{{ t('inventory.form.minStock') }}</label>
            <InputNumber v-model="itemForm.minStock" :min="0" showButtons />
          </div>
        </div>

        <div class="field">
          <label>{{ t('inventory.form.unitPrice') }}</label>
          <InputNumber v-model="itemForm.unitPrice" mode="currency" currency="PEN" />
        </div>
      </div>

      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="displayDialog = false" />
        <Button :label="t('common.save')" icon="pi pi-save" @click="saveItem" />
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.inventory-page { min-height: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }

.eyebrow {
  color: #0b1680;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 2.2rem;
  line-height: 1.1;
}

.page-header p { margin: 0.5rem 0 0; color: #64748b; }

.add-button { background: #0b1680; border-radius: 12px; }

.toolbar { margin-bottom: 1.5rem; }

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  z-index: 10;
}

.search-box :deep(.p-inputtext) {
  flex: 1;
  border: none;
  padding-left: 2.5rem;
}

.table-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e8edf5;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.item-name { display: flex; flex-direction: column; gap: 0.2rem; }
.item-name strong { color: #1e293b; }
.item-name span { font-size: 0.8rem; color: #64748b; }

.actions { display: flex; gap: 0.5rem; }

.form-grid { display: flex; flex-direction: column; gap: 1rem; padding-top: 0.5rem; }

.row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 0.4rem; }

.field label { font-size: 0.85rem; font-weight: 700; color: #374151; }

.required { color: #ef4444; }

:deep(.p-inputtext),
:deep(.p-inputnumber) { border-radius: 10px; }
</style>