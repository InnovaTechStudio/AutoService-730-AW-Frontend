<script setup>
/**
 * @file customer-form.vue
 * @description **Customer Form Dialog Component**
 *
 * Reusable modal dialog for creating and editing customers.
 * This component is used in the customer management page and follows
 * the Presentation Layer of the Customer Management domain.
 *
 * Features:
 * - Supports both Create and Edit modes
 * - Two-way data binding with parent component via v-model
 * - Emits events for save and visibility control
 * - Fully internationalized using Vue I18n
 */
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import {useI18n} from 'vue-i18n'


const props = defineProps({
  visible: Boolean,
  editMode: Boolean,
  form: Object
})

const emit = defineEmits([
  'update:visible',
  'save'
])

const {t} = useI18n();

</script>

<template>

  <Dialog
      :visible="visible"
      modal
      :style="{ width: '42rem' }"
      :draggable="false"
      :closable="true"
      class="customer-dialog"
      @update:visible="
      emit('update:visible', $event)
    "
  >
    <!-- HEADER -->

    <template #header>

      <div class="custom-header">
        <div class="header-badge">
          <i class="pi pi-user-plus"></i>

        </div>

        <div>
          <span class="mini-title">
            {{ t('customers.form.newRecord') }}
          </span>

          <h2>
            {{
              editMode
                  ? t('customers.form.editTitle')
                  : t('customers.form.registerTitle')
            }}
          </h2>
        </div>

      </div>

    </template>

    <!-- FORM -->

    <div class="customer-form">

      <!-- FULL NAME -->

      <div class="field">
        <label>{{t('customers.form.fullName')}}</label>
        <div class="input-container">
          <i class="pi pi-user"></i>
          <InputText
              v-model="form.fullName"
              placeholder="Ex: Juan Perez"
          />

        </div>

      </div>

      <!-- GRID -->
      <div class="double-grid">

        <!-- DNI -->
        <div class="field">

          <label>{{t('customers.form.dni')}}</label>
          <div class="input-container">
            <i class="pi pi-id-card"></i>
            <InputText
                v-model="form.dni"
                placeholder="12345678"
            />

          </div>
        </div>

        <!-- PHONE -->
        <div class="field">

          <label>{{t('customers.form.phone')}}</label>
          <div class="input-container">
            <i class="pi pi-phone"></i>

            <InputText
                v-model="form.phone"
                placeholder="+51 999 999 999"
            />

          </div>
        </div>
      </div>

      <!-- EMAIL -->

      <div class="field">

        <label>{{t('customers.form.email')}}</label>
        <div class="input-container">
          <i class="pi pi-envelope"></i>
          <InputText
              v-model="form.email"
              placeholder="customer@email.com"
          />

        </div>

      </div>

      <!-- STATUS -->
      <div class="status-card">
        <div>
          <h4>{{t('customers.form.statusTitle')}}</h4>
          <p>{{t('customers.form.statusDesc')}}</p>

        </div>

        <Tag
            :value="t('customers.form.active')"
            severity="info"
            rounded
        />

      </div>

    </div>

    <!-- FOOTER -->

    <template #footer>

      <div class="footer-actions">

        <Button
            :label="t('customers.form.cancel')"
            text
            class="cancel-btn"
            @click="
            emit('update:visible', false)
          "
        />

        <Button
            :label="
            editMode
            ? t('customers.form.update')
            : t('customers.form.save')
          "
            icon="pi pi-check"
            class="save-btn"
            @click="emit('save')"
        />

      </div>

    </template>

  </Dialog>

</template>

<style scoped>

/* MODAL */
.customer-dialog{
  border-radius: 24px;
  overflow: hidden;
}
/* HEADER */
.custom-header{
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: .5rem;
}

.header-badge{
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #0b1680;
  display: flex;
  justify-content: center;
  align-items: center;

  color: white;
  font-size: 1.5rem;

  box-shadow: 0 10px 25px rgba(37,99,235,.3);
}

.mini-title{
  font-size: .75rem;
  font-weight: 700;
  color: #0b1680;;
  letter-spacing: 1px;
}

.custom-header h2{
  margin-top: .2rem;
  font-size: 1.5rem;
  color: #111827;
}

/* FORM */

.customer-form{
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.field{
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.field label{
  font-size: .8rem;
  font-weight: 700;
  color: #374151;
  letter-spacing: .5px;
}

/* INPUT */

.input-container{
  display: flex;
  align-items: center;
  gap: .8rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: .9rem 1rem;
  transition: .2s;
}

.input-container:focus-within{
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,.1);
}

.input-container i{
  color: #9ca3af;
}

.input-container :deep(input){
  border: none !important;
  background: transparent !important;
  width: 100%;
  box-shadow: none !important;
  padding: 0 !important;
}

/* GRID */

.double-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* STATUS CARD */

.status-card{
  margin-top: .5rem;

  background: linear-gradient(
      135deg,
      #eff6ff,
      #dbeafe
  );
  border-radius: 18px;
  padding: 1rem 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #bfdbfe;
}

.status-card h4{
  margin-bottom: .3rem;
  color: #1e3a8a;
}

.status-card p{
  font-size: .9rem;
  color: #4b5563;
}

/* FOOTER */

.footer-actions{
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn{
  color: #6b7280;
}

.save-btn{
  background: #0b1680 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: .9rem 1.5rem !important;
  box-shadow: 0 10px 20px rgba(37,99,235,.2);
}

</style>