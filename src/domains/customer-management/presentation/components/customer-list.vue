<!-- customer-table.component.vue -->

<script setup>

import { ref, onMounted, computed } from 'vue'
import { useCustomerStore } from '../../application/customer.store'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

import CustomerForm from "./customer-form.vue";

const store = useCustomerStore()

const showFormModal = ref(false)
const showDeleteModal = ref(false)

const editMode = ref(false)

const selectedCustomerId = ref(null)

const customerForm = ref({
  fullName: '',
  dni: '',
  email: '',
  phone: ''
})
const searchTerm = ref('')
const filteredCustomers = computed(() => {

  if (!searchTerm.value) {
    return store.customers
  }

  return store.customers.filter(customer => {

    const search =
        searchTerm.value.toLowerCase()

    return (

        customer.fullName
            .toLowerCase()
            .includes(search)

        ||

        customer.email
            .toLowerCase()
            .includes(search)

        ||

        customer.dni
            .toLowerCase()
            .includes(search)

        ||

        customer.phone
            .toLowerCase()
            .includes(search)
    )
  })
})

onMounted(() => {
  store.fetchCustomers()
})
const openAddModal = () => {

  editMode.value = false

  customerForm.value = {
    fullName: '',
    dni: '',
    email: '',
    phone: ''
  }

  showFormModal.value = true
}

const openEditModal = (customer) => {

  editMode.value = true
  selectedCustomerId.value = customer.id
  customerForm.value = { ...customer }
  showFormModal.value = true
}

const saveCustomer = async () => {

  if(editMode.value){
    await store.updateCustomer(
        selectedCustomerId.value,
        customerForm.value
    )

  } else {
    await store.addCustomer(customerForm.value)
  }

  showFormModal.value = false
}

const openDeleteModal = (customer) => {

  selectedCustomerId.value = customer.id
  customerForm.value = customer
  showDeleteModal.value = true
}

const confirmDelete = async () => {

  await store.deleteCustomer(
      selectedCustomerId.value
  )
  showDeleteModal.value = false
}

</script>

<template>

  <div class="customer-management">

    <!-- HEADER -->
    <div class="top-section">

      <div class="customer-header">
        <div>
          <span class="eyebrow">Customer Management</span>
          <h1>Registered clients</h1>
          <p>Manage workshop customers</p>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-card">
          <span>Total registrados</span>
          <strong>{{ store.customers.length }}</strong>
        </div>
      </div>
        <Button
          label="Register Customer"
          icon="pi pi-plus"
          class="add-btn"
          @click="openAddModal"
      />
    </div>

    <!-- SEARCH -->
    <div class="search-container">
      <i class="pi pi-search"></i>
      <InputText
          v-model="searchTerm"
          placeholder="Search customer..."
      />

    </div>

    <!-- TABLE -->
    <div class="table-wrapper">
      <DataTable
          :value="filteredCustomers"
          responsiveLayout="scroll"
      >
        <Column
            field="fullName"
            header="FULL NAME"
        />
        <Column
            field="dni"
            header="DNI"
        />
        <Column
            field="email"
            header="EMAIL"
        />
        <Column
            field="phone"
            header="PHONE"
        />
        <Column header="ACTIONS">

          <template #body="slotProps">

            <div class="actions">

              <Button
                  icon="pi pi-pencil"
                  severity="contrast"
                  outlined
                  rounded
                  @click="openEditModal(slotProps.data)"
              />

              <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  rounded
                  @click="openDeleteModal(slotProps.data)"
              />

            </div>

          </template>

        </Column>

      </DataTable>

    </div>
    <!-- ADD / EDIT MODAL -->
    <!-- REGISTER / EDIT CUSTOMER MODAL -->
    <CustomerForm
        v-model:visible="showFormModal"
        :editMode="editMode"
        :form="customerForm"
        @save="saveCustomer"
    />
    <!-- DELETE MODAL -->

    <Dialog
        v-model:visible="showDeleteModal"
        modal
        :style="{ width: '28rem' }"
        :draggable="false"
    >

      <div class="delete-container">
        <div class="delete-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>

        <h2>Delete customer?</h2>
        <p>This action cannot be undone.</p>
        <strong>
          {{ customerForm.fullName }}
        </strong>

        <div class="delete-actions">

          <Button
              label="Cancel"
              severity="secondary"
              outlined
              @click="showDeleteModal = false"
          />

          <Button
              label="Delete"
              severity="danger"
              @click="confirmDelete"
          />

        </div>

      </div>

    </Dialog>

  </div>

</template>

<style scoped>
.summary-card {
  padding: 1rem 1.2rem;
  border: 1px solid #e8edf5;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.summary-card span {
  display: block;
  color: #64748b;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 0.25rem;
  color: #0b1680;
  font-size: 1.8rem;
}
.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 0.5rem;
  color: #0b1680;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.customer-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.customer-header p {
  max-width: 620px;
  margin: 0.75rem 0 0;
  color: #64748b;
}

.customer-management{
  min-height: 100vh;
}
.top-section{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.top-section h1{
  font-size: 3rem;
  color: #111827;
  margin-bottom: .3rem;
}

.top-section p{
  color: #6b7280;
}

.add-btn {
  background: #0b1680;
  border-color: #0b1680;
  border-radius: 14px;
}


/* SEARCH */

.search-container{
  background: white;
  padding: 1rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-container i{
  color: #9ca3af;
}

/* TABLE */

.table-wrapper{
  background: white;
  padding: 1rem;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,.04);
}

.actions{
  display: flex;
  gap: .5rem;
}


.modal-header h2{
  color: #111827;
}

.field label{
  font-weight: 600;
  color: #374151;
}
.delete-container{
  text-align: center;
  padding: 1rem;
}

.delete-icon{
  width: 70px;
  height: 70px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.delete-actions{
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
@media (max-width: 768px) {

  /* ========= HEADER ========= */

  .customer-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .customer-header h1 {
    font-size: 2rem;
    line-height: 1.1;
  }

  .customer-header p {
    max-width: 100%;
    font-size: 0.95rem;
  }

  /* ========= TOP SECTION ========= */

  .top-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .top-section h1 {
    font-size: 2rem;
  }

  .top-section p {
    font-size: 0.95rem;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  /* ========= SUMMARY CARDS ========= */

  .summary-card {
    padding: 1rem;
    border-radius: 16px;
  }

  .summary-card strong {
    font-size: 1.5rem;
  }

  /* ========= SEARCH ========= */

  .search-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;

    padding: 1rem;

    border-radius: 14px;
  }

  .search-container i {
    display: none;
  }

  /* ========= TABLE ========= */

  .table-wrapper {
    overflow-x: auto;
    border-radius: 16px;
    padding: 0.8rem;
  }

  /* ========= ACTIONS ========= */

  .actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  /* ========= MODAL ========= */

  .modal-header h2 {
    font-size: 1.4rem;
    text-align: center;
  }

  .field label {
    font-size: 0.92rem;
  }

  /* ========= DELETE ========= */

  .delete-container {
    padding: 0.5rem;
  }

  .delete-icon {
    width: 60px;
    height: 60px;
    font-size: 1.6rem;
  }

  .delete-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .delete-actions button {
    width: 100%;
  }
}
</style>