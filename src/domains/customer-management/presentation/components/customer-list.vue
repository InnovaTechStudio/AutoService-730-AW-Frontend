<script setup>
/**
 * @file customer-management.page.vue (formerly customer-list.vue)
 * @description **Customer Management Main Page**
 *
 * Main view for managing workshop customers. This component serves as the
 * central hub for the Customer Management domain in the Presentation Layer.
 *
 * Features:
 * - Displays a searchable and sortable list of customers
 * - Supports Create, Read, Update, and Delete (CRUD) operations
 * - Uses reusable CustomerForm component for both adding and editing
 * - Integrates with Customer Store for state management
 */
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCustomerStore } from '../../application/customer.store';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import CustomerForm from './customer-form.vue';

const { t } = useI18n();
const store = useCustomerStore();

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const selectedCustomerId = ref(null);
const customerForm = ref({ fullName: '', dni: '', email: '', phone: '' });
const searchTerm = ref('');

const filteredCustomers = computed(() => {
  if (!searchTerm.value) return store.customers;
  return store.customers.filter(customer => {
    const search = searchTerm.value.toLowerCase();
    return (
        customer.fullName.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.dni.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search)
    );
  });
});
/**
 * Lifecycle hook: Fetches customers when component is mounted.
 */
onMounted(() => { store.fetchCustomers(); });

/**
 * Opens the modal in "Create New Customer" mode.
 */
const openAddModal = () => {
  editMode.value = false;
  customerForm.value = { fullName: '', dni: '', email: '', phone: '' };
  showFormModal.value = true;
};

/**
 * Opens the modal in "Edit Customer" mode and pre-fills the form.
 *
 * @param {Object} customer - Customer object to edit
 */
const openEditModal = (customer) => {
  editMode.value = true;
  selectedCustomerId.value = customer.id;
  customerForm.value = { ...customer };
  showFormModal.value = true;
};

/**
 * Saves or updates a customer depending on the current mode.
 */
const saveCustomer = async () => {
  if (editMode.value) {
    await store.updateCustomer(selectedCustomerId.value, customerForm.value);
  } else {
    await store.addCustomer(customerForm.value);
  }
  showFormModal.value = false;
};

/**
 * Opens the delete confirmation dialog.
 *
 * @param {Object} customer - Customer to be deleted
 */
const openDeleteModal = (customer) => {
  selectedCustomerId.value = customer.id;
  customerForm.value = customer;
  showDeleteModal.value = true;
};

/**
 * Confirms and executes customer deletion.
 */
const confirmDelete = async () => {
  await store.deleteCustomer(selectedCustomerId.value);
  showDeleteModal.value = false;
};
</script>

<template>
  <div class="customer-management">

    <!-- HEADER -->
    <div class="top-section">
      <div class="customer-header">
        <div>
          <span class="eyebrow">{{ t('customers.eyebrow') }}</span>
          <h1>{{ t('customers.title') }}</h1>
          <p>{{ t('customers.description') }}</p>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-card">
          <span>{{ t('customers.totalRegistered') }}</span>
          <strong>{{ store.customers.length }}</strong>
        </div>
      </div>

      <Button
          :label="t('customers.registerButton')"
          icon="pi pi-plus"
          class="add-btn"
          @click="openAddModal"
      />
    </div>

    <!-- SEARCH -->
    <div class="search-container">
      <i class="pi pi-search"></i>
      <InputText v-model="searchTerm" :placeholder="t('customers.search')" />
    </div>

    <!-- TABLE -->
    <div class="table-wrapper">
      <DataTable :value="filteredCustomers" responsiveLayout="scroll">
        <Column field="fullName" :header="t('customers.columns.fullName')" />
        <Column field="dni" :header="t('customers.columns.dni')" />
        <Column field="email" :header="t('customers.columns.email')" />
        <Column field="phone" :header="t('customers.columns.phone')" />
        <Column :header="t('customers.columns.actions')">
          <template #body="slotProps">
            <div class="actions">
              <Button icon="pi pi-pencil" severity="contrast" outlined rounded @click="openEditModal(slotProps.data)" />
              <Button icon="pi pi-trash" severity="danger" outlined rounded @click="openDeleteModal(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- FORM MODAL -->
    <CustomerForm
        v-model:visible="showFormModal"
        :editMode="editMode"
        :form="customerForm"
        @save="saveCustomer"
    />

    <!-- DELETE MODAL -->
    <Dialog v-model:visible="showDeleteModal" modal :style="{ width: '28rem' }" :draggable="false">
      <div class="delete-container">
        <div class="delete-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h2>{{ t('customers.delete.title') }}</h2>
        <p>{{ t('customers.delete.description') }}</p>
        <strong>{{ customerForm.fullName }}</strong>
        <div class="delete-actions">
          <Button :label="t('customers.delete.cancel')" severity="secondary" outlined @click="showDeleteModal = false" />
          <Button :label="t('customers.delete.confirm')" severity="danger" @click="confirmDelete" />
        </div>
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
.summary-card { padding: 1rem 1.2rem; border: 1px solid #e8edf5; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 24px rgba(15,23,42,0.05); }
.summary-card span { display: block; color: #64748b; font-weight: 700; }
.summary-card strong { display: block; margin-top: 0.25rem; color: #0b1680; font-size: 1.8rem; }
.customer-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 1.5rem; }
.eyebrow { display: inline-flex; margin-bottom: 0.5rem; color: #0b1680; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.customer-header h1 { margin: 0; color: #0f172a; font-size: clamp(2rem,4vw,2.7rem); line-height: 1.05; letter-spacing: -0.04em; }
.customer-header p { max-width: 620px; margin: 0.75rem 0 0; color: #64748b; }
.customer-management { min-height: 100vh; }
.top-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.add-btn { background: #0b1680; border-color: #0b1680; border-radius: 14px; }
.search-container { background: white; padding: 1rem; border-radius: 16px; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.search-container i { color: #9ca3af; }
.table-wrapper { background: white; padding: 1rem; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.04); }
.actions { display: flex; gap: .5rem; }
.delete-container { text-align: center; padding: 1rem; }
.delete-icon { width: 70px; height: 70px; background: #fee2e2; color: #dc2626; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: auto; font-size: 2rem; margin-bottom: 1rem; }
.delete-actions { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; }

@media (max-width: 768px) {
  .customer-header { flex-direction: column; align-items: stretch; gap: 1rem; }
  .top-section { flex-direction: column; align-items: stretch; gap: 1rem; }
  .add-btn { width: 100%; justify-content: center; }
  .delete-actions { flex-direction: column; gap: 0.8rem; }
}
</style>