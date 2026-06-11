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
import InventoryCard from './components/InventoryCard.vue';

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
const categoryImages = {
  BRAKES:
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414',

  OIL:
      'https://images.unsplash.com/photo-1632823471565-1ecdf7d8c1b8',

  BATTERY:
      'https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac',

  TIRES:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39',

  ENGINE:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc'
};
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
const inventoryValue = computed(() =>
    inventoryStore.items.reduce(
        (sum, item) =>
            sum + (Number(item.stock || 0) * Number(item.unitPrice || 0)),
        0
    )
);
const totalItems = computed(() =>
    inventoryStore.items.length
);
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
    minStock: 3,
    image: ''
  };
  displayDialog.value = true;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    itemForm.value.image = e.target.result;
  };
  reader.readAsDataURL(file);
};

const editItem = (item) => {
  itemForm.value = { ...item };
  displayDialog.value = true;
};

const saveItem = async () => {
  if (!itemForm.value.name) return;

  const payload = {
    ...itemForm.value,
    image: itemForm.value.image || ''
  };

  if (itemForm.value.id) {
    await inventoryStore.updateItem(itemForm.value.id, payload);
  } else {
    await inventoryStore.addItem(payload);
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
    <div class="inventory-kpis">
      <div class="kpi-card">
        <span>Total Productos</span>
        <h2>{{ totalItems }}</h2>
      </div>
      <div class="kpi-card">
        <span>Valor Inventario</span>
        <h2>S/. {{ inventoryValue.toFixed(2) }}</h2>
      </div>
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
      <div v-if="filteredItems.length > 0" class="inventory-grid">
        <InventoryCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            @edit="editItem"
        />
      </div>

      <div v-else class="empty-state">
        <p>No se encontraron materiales en el inventario.</p>
      </div>
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
            <InputNumber v-model="itemForm.stock" :min="0" showButtons class="w-full" />
          </div>

          <div class="field">
            <label>{{ t('inventory.form.minStock') }}</label>
            <InputNumber v-model="itemForm.minStock" :min="0" showButtons class="w-full" />
          </div>
        </div>

        <div class="field">
          <label>{{ t('inventory.form.unitPrice') }}</label>
          <InputNumber v-model="itemForm.unitPrice" mode="currency" currency="PEN" />
        </div>

        <div class="field">
          <label>Imagen del Material</label>
          <div class="file-upload-container">
            <label for="inventory-image-upload" class="file-upload-btn">
              <i class="pi pi-upload"></i> Seleccionar Imagen
            </label>
            <input
                id="inventory-image-upload"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden-input"
            />
            <div v-if="itemForm.image" class="preview-box">
              <img :src="itemForm.image" alt="preview" />
            </div>
          </div>
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

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  background: white;
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
}
.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 1.5rem;
  align-items: center;
}
.hidden-input { display: none; }
.file-upload-btn {
  background: #eef2ff;
  color: #0b1680;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.file-upload-btn:hover { background: #e0e7ff; }
.preview-box {
  width: 100%;
  max-height: 180px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  background: white;
}
.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
:deep(.p-inputnumber.w-full) {
  width: 100%;
}
:deep(.p-inputnumber.w-full .p-inputtext) {
  width: 100%;
//rodrigo
.inventory-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  padding: 1.2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.kpi-card span {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.kpi-card h2 {
  margin: 0.5rem 0 0;
  color: #0b1680;
  font-size: 1.8rem;
  font-weight: 800;
}
@media (max-width: 992px) {
  .inventory-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .inventory-kpis {
    grid-template-columns: 1fr;
  }
}}
</style>