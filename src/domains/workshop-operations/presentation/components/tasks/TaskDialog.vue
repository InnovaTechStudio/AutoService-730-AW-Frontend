<script setup>
/**
 * @file TaskDialog.vue
 * @description Dialog for task creation and editing.
 */

import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

import { useInventoryStore } from '../../../../inventory-management/application/inventory.store';

const { t } = useI18n();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },

  task: {
    type: Object,
    required: true
  },

  workOrderOptions: {
    type: Array,
    default: () => []
  },

  mechanicOptions: {
    type: Array,
    default: () => []
  }
});

defineEmits([
  'update:visible',
  'save',
  'cancel'
]);

const inventoryStore = useInventoryStore();

onMounted(() => {
  if (inventoryStore.items.length === 0) {
    inventoryStore.fetchItems();
  }
});

/**
 * Adds a new part row.
 */
const addPart = () => {
  if (!props.task.parts) {
    props.task.parts = [];
  }

  props.task.parts.push({
    inventoryItemId: null,
    name: '',
    quantity: 1,
    unitPrice: 0
  });
};

/**
 * Removes a part row.
 *
 * @param {number} index - Part index.
 */
const removePart = (index) => {
  props.task.parts.splice(index, 1);
};

/**
 * Updates selected part information.
 *
 * @param {string|number} itemId - Inventory item id.
 * @param {number} index - Part index.
 */
const onPartSelected = (itemId, index) => {
  const item = inventoryStore.items.find(
      (inventoryItem) =>
          String(inventoryItem.id) === String(itemId)
  );

  if (!item) {
    return;
  }

  props.task.parts[index].name = item.name;
  props.task.parts[index].unitPrice =
      item.unitPrice;
};

/**
 * Calculates total task cost.
 */
const calculatedTotal = computed(() => {
  const labor =
      parseFloat(props.task.laborPrice) || 0;

  const parts = props.task.parts || [];

  const partsTotal = parts.reduce(
      (sum, part) =>
          sum +
          (
              (parseFloat(part.unitPrice) || 0) *
              (parseInt(part.quantity) || 1)
          ),
      0
  );

  return labor + partsTotal;
});
</script>

<template>
  <Dialog
      :visible="visible"
      :header="
      task?.id
        ? t('tasks.dialog.editTitle')
        : t('tasks.dialog.createTitle')
    "
      :modal="true"
      :closable="true"
      :style="{ width: '600px' }"
      class="p-fluid"
      @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-body">
      <div class="field">
        <label>
          {{ t('tasks.dialog.workOrder') }}

          <span class="required">
            *
          </span>
        </label>

        <Select
            v-model="task.workOrderId"
            :options="workOrderOptions"
            option-label="trackingCode"
            option-value="id"
            :placeholder="
            t('tasks.dialog.selectWorkOrder')
          "
            filter
        />
      </div>

      <div class="field">
        <label>
          {{ t('tasks.dialog.description') }}

          <span class="required">
            *
          </span>
        </label>

        <InputText
            v-model.trim="task.description"
            :placeholder="
            t('tasks.dialog.descriptionPlaceholder')
          "
        />
      </div>

      <div class="row-grid">
        <div class="field">
          <label>
            {{ t('tasks.dialog.assignedMechanic') }}
          </label>

          <Select
              v-model="task.mechanicId"
              :options="mechanicOptions"
              option-label="fullName"
              option-value="id"
              :placeholder="
              t('tasks.dialog.selectMechanic')
            "
              filter
              showClear
          />
        </div>

        <div class="field">
          <label>
            {{ t('tasks.dialog.laborCost') }}
          </label>

          <InputNumber
              v-model="task.laborPrice"
              mode="currency"
              currency="PEN"
          />
        </div>
      </div>

      <hr class="divider" />

      <div class="inventory-section">
        <div class="section-head">
          <label>
            <i class="pi pi-box"></i>

            {{ t('tasks.dialog.partsTitle') }}
          </label>

          <Button
              icon="pi pi-plus"
              :label="t('actions.add')"
              size="small"
              outlined
              @click="addPart"
          />
        </div>

        <div
            v-for="(part, index) in task.parts"
            :key="index"
            class="part-row"
        >
          <Select
              v-model="part.inventoryItemId"
              :options="inventoryStore.items"
              optionLabel="name"
              optionValue="id"
              filter
              :placeholder="
              t('tasks.dialog.searchInventory')
            "
              @change="
              onPartSelected($event.value, index)
            "
              class="part-select"
          />

          <InputNumber
              v-model="part.quantity"
              :min="1"
              showButtons
              class="part-qty"
          />

          <div class="part-subtotal">
            S/.
            {{
              (
                  (part.unitPrice || 0) *
                  (part.quantity || 1)
              ).toFixed(2)
            }}
          </div>

          <Button
              icon="pi pi-trash"
              text
              severity="danger"
              class="part-trash"
              @click="removePart(index)"
          />
        </div>

        <div
            v-if="
            !task.parts ||
            task.parts.length === 0
          "
            class="empty-parts"
        >
          {{ t('tasks.dialog.emptyParts') }}
        </div>
      </div>

      <div class="total-preview">
        <span>
          {{ t('tasks.dialog.totalCost') }}
        </span>

        <h2>
          S/. {{ calculatedTotal.toFixed(2) }}
        </h2>
      </div>
    </div>

    <template #footer>
      <Button
          :label="t('actions.cancel')"
          text
          severity="secondary"
          @click="$emit('cancel')"
      />

      <Button
          :label="
          task?.id
            ? t('tasks.actions.saveChanges')
            : t('tasks.actions.create')
        "
          icon="pi pi-check"
          class="save-btn"
          @click="$emit('save')"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
}

.required {
  color: #ef4444;
}

.row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.divider {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid #e2e8f0;
}

.inventory-section {
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-head label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #0f172a;
}

.part-row {
  display: grid;
  grid-template-columns: 1fr 110px 90px 40px;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.8rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.part-select,
.part-qty {
  width: 100%;
}

.part-qty :deep(.p-inputnumber-input) {
  width: 100%;
  text-align: center;
}

.part-subtotal {
  font-size: 0.95rem;
  font-weight: 700;
  text-align: right;
  color: #0b1680;
}

.part-trash {
  margin: 0 auto;
}

.empty-parts {
  padding: 1rem 0;
  font-size: 0.9rem;
  text-align: center;
  color: #94a3b8;
}

.total-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  margin-top: 0.5rem;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 16px;
}

.total-preview span {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #4f46e5;
}

.total-preview h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #312e81;
}

.save-btn {
  background: #0b1680 !important;
  border: none;
}
</style>