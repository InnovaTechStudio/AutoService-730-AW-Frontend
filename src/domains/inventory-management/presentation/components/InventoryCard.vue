<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

defineProps({
  item: Object
});

defineEmits(['edit']);

const getStockSeverity = (item) => {
  if (item.stock <= item.minStock) return 'danger';
  if (item.stock <= item.minStock + 2) return 'warning';
  return 'success';
};

const getStockLabel = (item) => {
  if (item.stock <= item.minStock) return 'Stock bajo';
  return 'Disponible';
};
</script>

<template>
  <Card class="inventory-card">
    <template #header>
      <div class="image-wrapper">
        <img :src="item.image" :alt="item.name" class="item-image" />
      </div>
    </template>

    <template #content>
      <div class="item-header">
        <Tag :value="item.category" severity="info" rounded />
        <h3>{{ item.name }}</h3>
        <p>{{ item.description || 'Material disponible para servicios del taller.' }}</p>
      </div>

      <div class="item-info">
        <div>
          <span>Marca</span>
          <strong>{{ item.brand }}</strong>
        </div>

        <div>
          <span>Precio</span>
          <strong>S/. {{ item.unitPrice.toFixed(2) }}</strong>
        </div>

        <div>
          <span>Stock</span>
          <strong>{{ item.stock }}</strong>
        </div>
      </div>

      <div class="compatibility">
        <span>Compatible con:</span>

        <div class="brand-tags">
          <Tag
              v-for="brand in item.compatibleVehicleBrands"
              :key="brand"
              :value="brand"
              severity="secondary"
              rounded
          />
        </div>
      </div>

      <div class="stock-row">
        <Tag
            :value="getStockLabel(item)"
            :severity="getStockSeverity(item)"
            rounded
        />

        <small>Stock mínimo: {{ item.minStock }}</small>
      </div>

      <div class="card-actions">
        <Button
            label="Actualizar stock"
            icon="pi pi-refresh"
            outlined
            class="stock-button"
            @click="$emit('edit', item)"
        />

        <Button
            icon="pi pi-pencil"
            severity="info"
            outlined
            class="edit-button"
            @click="$emit('edit', item)"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.inventory-card {
  overflow: hidden;
  border: 1px solid #e8edf5;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.image-wrapper {
  height: 190px;
  background: #eef2ff;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-header h3 {
  margin: .8rem 0 .35rem;
  color: #0f172a;
  font-size: 1.2rem;
}

.item-header p {
  min-height: 44px;
  color: #64748b;
  line-height: 1.45;
}

.item-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .7rem;
  margin: 1rem 0;
}

.item-info div {
  padding: .75rem;
  border-radius: 16px;
  background: #f8fafc;
}

.item-info span,
.compatibility span {
  display: block;
  color: #64748b;
  font-size: .78rem;
  font-weight: 800;
}

.item-info strong {
  display: block;
  margin-top: .25rem;
  color: #0f172a;
}

.brand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
  margin-top: .55rem;
}

.stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  color: #64748b;
}

.card-actions {
  display: flex;
  gap: .6rem;
}

.stock-button {
  flex: 1;
  border-radius: 14px;
}

.edit-button {
  width: 46px;
  border-radius: 14px;
}

@media (max-width: 720px) {
  .item-info {
    grid-template-columns: 1fr;
  }
}
</style>