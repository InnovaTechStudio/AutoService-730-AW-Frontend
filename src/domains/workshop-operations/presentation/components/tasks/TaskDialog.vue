<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
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

defineEmits(['update:visible', 'save', 'cancel']);
</script>

<template>
  <Dialog
      :visible="visible"
      :header="task?.id ? 'Editar tarea' : 'Nueva tarea'"
      :modal="true"
      class="task-dialog p-fluid"
      @update:visible="$emit('update:visible', $event)"
  >
    <div class="field">
      <label>Orden de trabajo</label>
      <Dropdown
          v-model="task.workOrderId"
          :options="workOrderOptions"
          option-label="trackingCode"
          option-value="id"
          placeholder="Seleccionar orden"
          filter
      />
    </div>

    <div class="field">
      <label>Descripción</label>
      <InputText v-model.trim="task.description" placeholder="Ej: Cambio de aceite" />
    </div>

    <div class="field">
      <label>Mecánico asignado</label>
      <Dropdown
          v-model="task.mechanicId"
          :options="mechanicOptions"
          option-label="fullName"
          option-value="id"
          placeholder="Seleccionar mecánico"
          filter
      />
    </div>

    <div class="formgrid grid">
      <div class="field col">
        <label>Estado</label>
        <Dropdown v-model="task.status" :options="statusOptions" />
      </div>

      <div class="field col">
        <label>Prioridad</label>
        <Dropdown v-model="task.priority" :options="priorityOptions" />
      </div>
    </div>

    <div class="field">
      <label>Tiempo estimado</label>
      <InputNumber v-model="task.estimatedTime" suffix=" h" :min="1" :max="24" showButtons />
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="$emit('cancel')" />
      <Button label="Guardar" icon="pi pi-check" @click="$emit('save')" />
    </template>
  </Dialog>
</template>

<style scoped>
.task-dialog {
  width: min(560px, 92vw);
}
</style>