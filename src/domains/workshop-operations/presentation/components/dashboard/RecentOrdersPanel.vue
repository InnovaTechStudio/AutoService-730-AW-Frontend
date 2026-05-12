<template>
  <Card class="panel-card">
    <template #content>
      <div class="panel-heading">
        <div>
          <h2>Actividad reciente</h2>
          <p>Últimas órdenes registradas.</p>
        </div>
        <Button icon="pi pi-arrow-right" rounded text @click="$emit('view-orders')" />
      </div>

      <DataTable :value="orders" class="p-datatable-sm clean-table" responsiveLayout="scroll">
        <Column field="trackingCode" header="Código" />

        <Column field="status" header="Estado">
          <template #body="slotProps">
            <Tag :value="slotProps.data.status" :severity="getOrderSeverity(slotProps.data.status)" rounded />
          </template>
        </Column>

        <Column header="Monto">
          <template #body="slotProps">
            S/. {{ slotProps.data.price || 0 }}
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

defineProps({
  orders: {
    type: Array,
    default: () => []
  }
});

defineEmits(['view-orders']);

const getOrderSeverity = (status) => {
  if (status === 'Finalizado' || status === 'Completado') return 'success';
  if (status === 'En Proceso') return 'info';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Cancelado') return 'danger';
  return 'secondary';
};
</script>

<style scoped>
.panel-card {
  border-radius: 24px;
  border: 1px solid #e8edf5;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.28rem;
}

p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.clean-table {
  overflow: hidden;
  border-radius: 16px;
}

.clean-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #475569;
  font-size: 0.82rem;
}
</style>