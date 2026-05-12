<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

defineProps({
  visible: Boolean,
  mechanic: Object,
  specialtyOptions: Array
});

defineEmits(['update:visible', 'save', 'cancel']);
</script>

<template>
  <Dialog
      :visible="visible"
      :header="mechanic?.id ? 'Editar mecánico' : 'Registrar mecánico'"
      :modal="true"
      class="mechanic-dialog p-fluid"
      @update:visible="$emit('update:visible', $event)"
  >
    <div class="field">
      <label for="fullName">Nombre completo</label>
      <InputText id="fullName" v-model.trim="mechanic.fullName" />
    </div>

    <div class="field">
      <label for="specialty">Especialidad</label>
      <Dropdown
          id="specialty"
          v-model="mechanic.specialty"
          :options="specialtyOptions"
          placeholder="Seleccionar especialidad"
      />
    </div>

    <div class="field">
      <label for="maxCapacity">Capacidad máxima de tareas</label>
      <InputNumber
          id="maxCapacity"
          v-model="mechanic.maxCapacity"
          showButtons
          :min="1"
          :max="10"
      />
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="$emit('cancel')" />
      <Button label="Guardar" icon="pi pi-check" @click="$emit('save')" />
    </template>
  </Dialog>
</template>

<style scoped>
.mechanic-dialog {
  width: min(460px, 92vw);
}
</style>