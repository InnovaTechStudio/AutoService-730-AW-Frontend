<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import {useI18n} from 'vue-i18n'
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

defineProps({
  visible: Boolean,
  task: Object,
  workOrderOptions: Array,
  mechanicOptions: Array,
  statusOptions: Array,
  priorityOptions: Array
});

const {t} = useI18n();

defineEmits(['update:visible', 'save', 'cancel']);
</script>

<template>
  <Dialog
      :visible="visible"
      :header="task?.id ? t('tasks.dialog.editTitle') : t('tasks.dialog.newTitle')"
      :modal="true"
      class="task-dialog p-fluid"
      @update:visible="$emit('update:visible', $event)"
  >
    <div class="field">
      <label>{{ t('tasks.dialog.workOrder') }}</label>
      <Dropdown
          v-model="task.workOrderId"
          :options="workOrderOptions"
          option-label="trackingCode"
          option-value="id"
          :placeholder="t('tasks.dialog.selectOrder')"
          filter
      />
    </div>

    <div class="field">
      <label>{{ t('tasks.dialog.description') }}</label>
      <InputText v-model.trim="task.description" :placeholder="t('tasks.dialog.descPlaceholder')" />
    </div>

    <div class="field">
      <label>{{ t('tasks.dialog.assignedMechanic') }}</label>
      <Dropdown
          v-model="task.mechanicId"
          :options="mechanicOptions"
          option-label="fullName"
          option-value="id"
          :placeholder="t('tasks.dialog.selectMechanic')"
          filter
      />
    </div>

    <div class="formgrid grid">
      <div class="field col">
        <label>{{ t('tasks.dialog.status') }}</label>
        <Dropdown v-model="task.status" :options="statusOptions" />
      </div>

      <div class="field col">
        <label>{{ t('tasks.dialog.priority') }}</label>
        <Dropdown v-model="task.priority" :options="priorityOptions" />
      </div>
    </div>

    <div class="field">
      <label>{{ t('tasks.dialog.estimatedTime') }}</label>
      <InputNumber v-model="task.estimatedTime" suffix=" h" :min="1" :max="24" showButtons />
    </div>

    <template #footer>
      <Button :label="t('tasks.dialog.cancel')" icon="pi pi-times" text @click="$emit('cancel')" />
      <Button :label="t('tasks.dialog.save')" icon="pi pi-check" @click="$emit('save')" />
    </template>
  </Dialog>
</template>

<style scoped>
.task-dialog {
  width: min(560px, 92vw);
}
</style>