<template>
  <div class="customer-list-container">
    <div class="header-actions">
      <h1>Directorio de Clientes</h1>
      <Button
          label="Nuevo Cliente"
          icon="pi pi-plus"
          severity="success"
          @click="openNewCustomerDialog"
      />
    </div>

    <DataTable
        :value="customerStore.customers"
        :loading="customerStore.loading"
        dataKey="id"
        stripedRows
        responsiveLayout="scroll"
        class="p-datatable-sm"
    >
      <Column field="fullName" header="Nombre Completo"></Column>
      <Column field="dni" header="DNI"></Column>
      <Column field="email" header="Correo"></Column>
      <Column field="phone" header="Teléfono"></Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="info" text rounded @click="editCustomer(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog
        v-model:visible="customerDialog"
        header="Registrar Nuevo Cliente"
        :modal="true"
        class="p-fluid"
        :style="{ width: '450px' }"
    >
      <div class="field">
        <label for="name">Nombre Completo</label>
        <InputText id="name" v-model.trim="newCustomer.fullName" required autofocus />
      </div>
      <div class="field">
        <label for="dni">DNI</label>
        <InputText id="dni" v-model.trim="newCustomer.dni" required />
      </div>
      <div class="field">
        <label for="email">Correo Electrónico</label>
        <InputText id="email" v-model.trim="newCustomer.email" />
      </div>
      <div class="field">
        <label for="phone">Teléfono de Contacto</label>
        <InputText id="phone" v-model.trim="newCustomer.phone" />
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveCustomer" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCustomerStore } from '../application/customer.store';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';

const customerStore = useCustomerStore();
const customerDialog = ref(false);

const newCustomer = ref({
  fullName: '',
  dni: '',
  email: '',
  phone: ''
});

onMounted(() => {
  customerStore.fetchCustomers();
});

const openNewCustomerDialog = () => {
  newCustomer.value = { fullName: '', dni: '', email: '', phone: '' };
  customerDialog.value = true;
};

const hideDialog = () => {
  customerDialog.value = false;
};

const saveCustomer = async () => {
  if (newCustomer.value.fullName && newCustomer.value.dni) {
    if (newCustomer.value.id) {
      await customerStore.updateCustomer(newCustomer.value.id, { ...newCustomer.value });
    } else {
      await customerStore.addCustomer({ ...newCustomer.value });
    }
    customerDialog.value = false;
    newCustomer.value = { fullName: '', dni: '', email: '', phone: '' };
  }
};

const editCustomer = (customer) => {
  newCustomer.value = { ...customer };
  customerDialog.value = true;
};
</script>

<style scoped>
.customer-list-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.field {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #475569;
}
</style>