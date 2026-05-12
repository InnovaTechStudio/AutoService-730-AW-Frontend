<script setup>
/**
 * @file MechanicDialog.vue
 * @description **Mechanic Dialog Component**
 *
 * Reusable modal dialog for creating new mechanics and editing existing ones.
 * Used in the mechanics management page.
 *
 * Part of the **Staff Coordination** domain - Presentation Layer.
 *
 * Features:
 * - Supports both Create and Edit modes (determined by presence of `mechanic.id`)
 * - Two-way data binding via props/emits
 * - Form fields for name, specialty, and maximum task capacity
 */
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps({ visible: Boolean, mechanic: Object, specialtyOptions: Array });
defineEmits(['update:visible', 'save', 'cancel']);
</script>

<template>
  <Dialog
      :visible="visible"
      :header="mechanic?.id ? t('mechanics.dialog.editTitle') : t('mechanics.dialog.registerTitle')"
      :modal="true"
      class="mechanic-dialog p-fluid"
      @update:visible="$emit('update:visible', $event)"
  >
    <div class="field">
      <label for="fullName">{{ t('mechanics.dialog.fullName') }}</label>
      <InputText id="fullName" v-model.trim="mechanic.fullName" />
    </div>
    <div class="field">
      <label for="specialty">{{ t('mechanics.dialog.specialty') }}</label>
      <Dropdown id="specialty" v-model="mechanic.specialty" :options="specialtyOptions" :placeholder="t('mechanics.dialog.selectSpecialty')" />
    </div>
    <div class="field">
      <label for="maxCapacity">{{ t('mechanics.dialog.maxCapacity') }}</label>
      <InputNumber id="maxCapacity" v-model="mechanic.maxCapacity" showButtons :min="1" :max="10" />
    </div>
    <template #footer>
      <Button :label="t('mechanics.dialog.cancel')" icon="pi pi-times" text @click="$emit('cancel')" />
      <Button :label="t('mechanics.dialog.save')" icon="pi pi-check" @click="$emit('save')" />
    </template>
  </Dialog>
</template>

<style scoped>
.mechanic-dialog { width: min(460px,92vw); }
</style>