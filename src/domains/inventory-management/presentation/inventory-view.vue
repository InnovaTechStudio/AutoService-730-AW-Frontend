<script setup>
import { computed, onMounted, ref } from 'vue';
import { useInventoryStore } from '../application/inventory.store';

import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

import InventoryCard from './components/InventoryCard.vue';
import InventoryFormDialog from './components/InventoryFormDialog.vue';

const inventoryStore = useInventoryStore();

const search = ref('');
const selectedCategory = ref(null);
const dialogVisible = ref(false);
const selectedItem = ref(null);

const categories = computed(() => {
  const unique = [...new Set(inventoryStore.items.map(item => item.category))];

  return [
    { label: 'Todas', value: null },
    ...unique.map(category => ({ label: category, value: category }))
  ];
});

const filteredItems = computed(() => {
  return inventoryStore.items.filter(item => {
    const text = `${item.name} ${item.brand} ${item.category}`.toLowerCase();
    const matchesSearch = text.includes(search.value.toLowerCase());
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

const totalItems = computed(() => inventoryStore.items.length);
const lowStockCount = computed(() => inventoryStore.lowStockItems.length);
const totalStockValue = computed(() =>
    inventoryStore.items.reduce((total, item) => total + item.stock * item.unitPrice, 0)
);

const openNewDialog = () => {
  selectedItem.value = null;
  dialogVisible.value = true;
};

const openEditDialog = (item) => {
  selectedItem.value = item;
  dialogVisible.value = true;
};

const saveItem = async (itemData) => {
  if (itemData.id) {
    await inventoryStore.updateItem(itemData.id, itemData);
  } else {
    await inventoryStore.addItem(itemData);
  }

  dialogVisible.value = false;
  selectedItem.value = null;
};

onMounted(async () => {
  await inventoryStore.fetchInventory();
});
</script>

<template>
  <section class="inventory-page">
    <header class="inventory-header">
      <div>
        <span class="eyebrow">Inventario del taller</span>
        <h1>Herramientas y materiales</h1>
        <p>
          Administra repuestos, materiales, marcas, precios y stock disponible para los servicios del taller.
        </p>
      </div>

      <Button
          label="Nuevo material"
          icon="pi pi-plus"
          severity="success"
          class="new-button"
          @click="openNewDialog"
      />
    </header>

    <section class="summary-grid">
      <Card class="summary-card">
        <template #content>
          <span>Total productos</span>
          <strong>{{ totalItems }}</strong>
          <small>Registrados en inventario</small>
        </template>
      </Card>

      <Card class="summary-card">
        <template #content>
          <span>Stock bajo</span>
          <strong>{{ lowStockCount }}</strong>
          <small>Requieren reposición</small>
        </template>
      </Card>

      <Card class="summary-card">
        <template #content>
          <span>Valor de inventario</span>
          <strong>S/. {{ totalStockValue.toFixed(2) }}</strong>
          <small>Según stock actual</small>
        </template>
      </Card>
    </section>

    <Card class="filters-card">
      <template #content>
        <div class="filters-row">
          <span class="p-input-icon-left search-box">
            <i class="pi pi-search"></i>
            <InputText
                v-model="search"
                placeholder="Buscar por material, marca o categoría"
                class="w-full"
            />
          </span>

          <Dropdown
              v-model="selectedCategory"
              :options="categories"
              option-label="label"
              option-value="value"
              placeholder="Filtrar categoría"
              class="category-filter"
          />
        </div>
      </template>
    </Card>

    <section class="inventory-grid">
      <InventoryCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @edit="openEditDialog"
      />
    </section>

    <InventoryFormDialog
        v-model:visible="dialogVisible"
        :item="selectedItem"
        @save="saveItem"
    />
  </section>
</template>

<style scoped>
.inventory-page {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
  color: #0f172a;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  color: #0b1680;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.inventory-header h1 {
  margin: .35rem 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.inventory-header p {
  max-width: 780px;
  color: #64748b;
  font-size: 1rem;
}

.new-button {
  min-width: 190px;
  height: 48px;
  border-radius: 16px;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

.summary-card,
.filters-card {
  border: 1px solid #e8edf5;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.summary-card span {
  color: #64748b;
  font-weight: 800;
}

.summary-card strong {
  display: block;
  margin: .45rem 0 .25rem;
  color: #0b1680;
  font-size: 2rem;
  line-height: 1;
}

.summary-card small {
  color: #94a3b8;
}

.filters-card {
  margin-bottom: 1.5rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  flex: 1;
}

.search-box :deep(input),
.category-filter {
  height: 46px;
  border-radius: 14px;
}

.category-filter {
  width: 260px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 1.2rem;
}

@media (max-width: 1200px) {
  .inventory-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .inventory-page {
    padding: 1rem;
  }

  .inventory-header,
  .filters-row {
    flex-direction: column;
  }

  .new-button,
  .category-filter {
    width: 100%;
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }
}
</style>