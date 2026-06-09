<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';
import { useVehicleStore } from '../../fleet-management/application/vehicle.store';
import { useAuthStore } from '../../auth/application/auth.store';
import { useInventoryStore } from '../../inventory-management/application/inventory.store';

import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import ProgressBar from 'primevue/progressbar';

const ORDER_STATUS = { FINISHED: 'FINISHED' };
const TASK_STATUS = { COMPLETED: 'COMPLETED' };

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const workOrderStore = useWorkOrderStore();
const taskStore = useTaskStore();
const vehicleStore = useVehicleStore();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const orderId = route.params.id;

const showTaskDialog = ref(false);
const diagnosis = ref('');

const priorities = [
  { value: 'LOW', label: t('priorities.low') || 'Baja' },
  { value: 'MEDIUM', label: t('priorities.medium') || 'Media' },
  { value: 'HIGH', label: t('priorities.high') || 'Alta' }
];

const newTask = ref({
  description: '',
  priority: 'MEDIUM',
  estimatedTime: 1.0,
  laborPrice: 0.0,
  parts: []
});

onMounted(async () => {
  await Promise.all([
    workOrderStore.fetchWorkOrders(),
    taskStore.fetchAllTasks(),
    vehicleStore.fetchVehicles(),
    inventoryStore.fetchItems()
  ]);
});

const order = computed(() => workOrderStore.workOrders.find(o => String(o.id) === String(orderId)));
const vehicle = computed(() => vehicleStore.vehicles.find(v => String(v.id) === String(order.value?.vehicleId)));
const tasks = computed(() => taskStore.tasks.filter(t => String(t.workOrderId) === String(orderId)));
const isOrderClosed = computed(() => order.value?.status === ORDER_STATUS.FINISHED);

const totalLabor = computed(() => tasks.value.reduce((sum, task) => sum + Number(task.laborPrice || 0), 0));

const totalOrderCost = computed(() => {
  return tasks.value.reduce((sum, task) => {
    const labor = Number(task.laborPrice || 0);
    const partsTotal = (task.parts || []).reduce((pSum, part) => pSum + (Number(part.unitPrice || 0) * Number(part.quantity || 1)), 0);
    return sum + labor + partsTotal;
  }, 0);
});

const completedTasks = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.COMPLETED).length);
const progress = computed(() => tasks.value.length ? Math.round((completedTasks.value / tasks.value.length) * 100) : 0);
const canFinishOrder = computed(() => tasks.value.length > 0 && completedTasks.value === tasks.value.length);

const updateOrderPrice = async () => {
  await workOrderStore.updateOrderAutoPrice(order.value.id, totalOrderCost.value);
};

const addPart = () => {
  newTask.value.parts.push({ inventoryItemId: null, name: '', quantity: 1, unitPrice: 0 });
};

const removePart = (index) => {
  newTask.value.parts.splice(index, 1);
};

const onPartSelected = (itemId, index) => {
  const item = inventoryStore.items.find(i => String(i.id) === String(itemId));
  if (item) {
    newTask.value.parts[index].name = item.name;
    newTask.value.parts[index].unitPrice = item.unitPrice;
  }
};

const newTaskTotalCost = computed(() => {
  const labor = Number(newTask.value.laborPrice || 0);
  const parts = newTask.value.parts.reduce((sum, part) => sum + (Number(part.unitPrice || 0) * Number(part.quantity || 1)), 0);
  return labor + parts;
});

const createTask = async () => {
  if (isOrderClosed.value) return;
  if (!newTask.value.description) return;

  await taskStore.addTask({
    workOrderId: Number(orderId),
    mechanicId: authStore.mechanicId,
    description: newTask.value.description,
    priority: newTask.value.priority,
    estimatedTime: newTask.value.estimatedTime,
    laborPrice: newTask.value.laborPrice,
    parts: newTask.value.parts
  });

  await taskStore.fetchAllTasks();
  await updateOrderPrice();

  showTaskDialog.value = false;
  newTask.value = { description: '', priority: 'MEDIUM', estimatedTime: 1.0, laborPrice: 0.0, parts: [] };
};

const completeTask = async (task) => {
  if (isOrderClosed.value) return;
  await taskStore.updateTask(task.id, { ...task, status: TASK_STATUS.COMPLETED });
  await taskStore.fetchAllTasks();
  await updateOrderPrice();
};

const finishOrder = async () => {
  await workOrderStore.updateWorkOrderChecklist(order.value.id, {
    ...order.value,
    status: ORDER_STATUS.FINISHED,
    qaChecklist: { tasksCompleted: true, sparePartsChecked: true, diagnosisValidated: true, cleaningDone: true, finalTestDone: true }
  });
  await workOrderStore.fetchWorkOrders();
};

const getPriorityLabel = (priorityValue) => {
  const found = priorities.find(p => p.value === priorityValue);
  return found ? found.label : priorityValue;
};
</script>

<template>
  <div class="mechanic-order-page">
    <header class="page-header">
      <Button icon="pi pi-arrow-left" text @click="router.push('/mechanic/workspace')" />
      <div>
        <h1>{{ $t('mechanicOrder.order') }} {{ order?.trackingCode }}</h1>
        <p>{{ $t('mechanicOrder.manageDescription') }}</p>
      </div>
    </header>

    <Card class="vehicle-card">
      <template #content>
        <div class="vehicle-info">
          <i class="pi pi-car vehicle-icon"></i>
          <div>
            <h2>{{ vehicle?.brand }} {{ vehicle?.model }}</h2>
            <span>{{ vehicle?.plate }}</span>
          </div>
        </div>
      </template>
    </Card>

    <Card class="diagnosis-card">
      <template #content>
        <h3>{{ $t('mechanicOrder.diagnosis') }}</h3>
        <Textarea v-model="diagnosis" :disabled="isOrderClosed" rows="4" class="w-full" :placeholder="$t('mechanicOrder.diagnosisPlaceholder') || 'Ingrese el diagnóstico...'" />
      </template>
    </Card>

    <Card class="tasks-card">
      <template #content>
        <div class="section-header">
          <h3>{{ $t('mechanicOrder.tasks') }}</h3>
          <Button :label="$t('mechanicOrder.newTask')" icon="pi pi-plus" :disabled="isOrderClosed" @click="showTaskDialog = true" />
        </div>

        <div v-if="tasks.length" class="tasks-list">
          <div v-for="task in tasks" :key="task.id" class="task-item">
            <div class="task-content">
              <h4>{{ task.description }}</h4>
              <div class="task-meta">
                <Tag :value="task.status === TASK_STATUS.COMPLETED ? ($t('tasks.summary.completed') || 'Completado') : task.status" :severity="task.status === TASK_STATUS.COMPLETED ? 'success' : 'warning'" />
                <Tag :value="getPriorityLabel(task.priority)" severity="info" />
                <span><i class="pi pi-clock"></i> {{ task.estimatedTime }}h</span>
                <strong>S/ {{ task.laborPrice }}</strong>
              </div>
              <div v-if="task.parts && task.parts.length > 0" class="task-parts">
                <small class="parts-title"><i class="pi pi-box"></i> Materiales:</small>
                <div class="parts-tags">
                  <Tag v-for="(p, i) in task.parts" :key="i" severity="secondary" :value="`${p.quantity}x ${p.name}`" />
                </div>
              </div>
            </div>
            <Button v-if="task.status !== TASK_STATUS.COMPLETED && !isOrderClosed" icon="pi pi-check" rounded severity="success" @click="completeTask(task)" />
          </div>
        </div>
        <div v-else class="empty-state">{{ $t('mechanicOrder.noTasks') }}</div>
      </template>
    </Card>

    <Card class="summary-card">
      <template #content>
        <div class="summary-row">
          <span>{{ $t('mechanicOrder.totalLabor') }}</span>
          <strong>S/ {{ totalLabor.toFixed(2) }}</strong>
        </div>
        <div class="summary-row highlight-total">
          <span>Costo Total (Inc. Materiales)</span>
          <strong>S/ {{ totalOrderCost.toFixed(2) }}</strong>
        </div>
        <div class="summary-row">
          <span>{{ $t('mechanicOrder.tasksLabel') }}</span>
          <strong>{{ completedTasks }} / {{ tasks.length }}</strong>
        </div>
        <div class="summary-row">
          <span>{{ $t('mechanicOrder.progress') }}</span>
          <strong>{{ progress }}%</strong>
        </div>
        <ProgressBar :value="progress" style="height:12px" />
        <Button v-if="canFinishOrder && order?.status !== ORDER_STATUS.FINISHED" :label="$t('mechanicOrder.finishOrder')" icon="pi pi-check-circle" severity="success" class="finish-order-btn" @click="finishOrder" />
      </template>
    </Card>

    <Dialog v-model:visible="showTaskDialog" modal :header="$t('mechanicOrder.dialog.newTask')" :style="{ width: '640px' }">
      <div class="dialog-form">
        <div class="field">
          <label class="font-bold text-sm">{{ $t('mechanicOrder.dialog.description') || 'Descripción de la tarea' }}</label>
          <InputText v-model="newTask.description" :placeholder="$t('mechanicOrder.dialog.descriptionPlaceholder') || 'Ej. Cambio de pastillas delanteras'" />
        </div>

        <div class="form-grid-2">
          <div class="field">
            <label class="font-bold text-sm">{{ $t('mechanicOrder.dialog.priority') || 'Prioridad' }}</label>
            <Dropdown v-model="newTask.priority" :options="priorities" optionLabel="label" optionValue="value" :placeholder="$t('mechanicOrder.dialog.priorityPlaceholder') || 'Seleccione la prioridad'" />
          </div>

          <div class="field">
            <label class="font-bold text-sm">{{ $t('mechanicOrder.dialog.estimatedTime') || 'Tiempo Estimado (Hrs)' }}</label>
            <InputNumber v-model="newTask.estimatedTime" :min="0.1" :max="48" :step="0.5" showButtons suffix=" h" placeholder="Ej. 1.5" />
          </div>
        </div>

        <div class="field">
          <label class="font-bold text-sm">{{ $t('mechanicOrder.dialog.laborPrice') || 'Costo Mano de Obra' }}</label>
          <InputNumber v-model="newTask.laborPrice" mode="currency" currency="PEN" locale="es-PE" :min="0" placeholder="S/. 0.00" />
        </div>

        <hr class="divider" />

        <div class="inventory-section">
          <div class="section-head">
            <label><i class="pi pi-box"></i> Materiales / Repuestos</label>
            <Button icon="pi pi-plus" label="Añadir" size="small" outlined @click="addPart" />
          </div>

          <div v-for="(part, index) in newTask.parts" :key="index" class="part-row">
            <Dropdown v-model="part.inventoryItemId" :options="inventoryStore.items" optionLabel="name" optionValue="id" filter placeholder="Buscar repuesto..." @change="onPartSelected($event.value, index)" class="part-select" />
            <InputNumber v-model="part.quantity" :min="1" showButtons class="part-qty" />
            <div class="part-subtotal">S/. {{ ((part.unitPrice || 0) * (part.quantity || 1)).toFixed(2) }}</div>
            <Button icon="pi pi-trash" text severity="danger" class="part-trash" @click="removePart(index)" />
          </div>
          <div v-if="newTask.parts.length === 0" class="empty-parts">Sin materiales asignados. Pulsa en "Añadir" para usar el inventario.</div>
        </div>

        <div class="total-preview">
          <span>Costo Estimado Tarea:</span>
          <h2>S/. {{ newTaskTotalCost.toFixed(2) }}</h2>
        </div>

        <div class="actions">
          <Button label="Cancelar" text severity="secondary" @click="showTaskDialog = false" class="mr-2" />
          <Button :label="$t('mechanicOrder.dialog.save') || 'Guardar Tarea'" icon="pi pi-save" @click="createTask" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.mechanic-order-page{min-height:100vh;background:#f8fafc;padding:1rem;}
.page-header{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;}
.page-header h1{margin:0;}
.page-header p{margin:0;color:#64748b;}
.vehicle-card,.tasks-card,.summary-card,.diagnosis-card{margin-bottom:1rem;border-radius:20px;}
.vehicle-info{display:flex;gap:1rem;align-items:center;}
.vehicle-icon{font-size:2rem;color:#0b1680;}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;}
.tasks-list{display:flex;flex-direction:column;gap:1rem;}
.task-item{display:flex;justify-content:space-between;align-items:flex-start;background:white;border:1px solid #e2e8f0;border-radius:16px;padding:1.25rem;}
.task-content { flex: 1; }
.task-content h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b; }
.task-meta{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center; color: #64748b; font-size: 0.9rem;}
.task-parts { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0; }
.parts-title { color: #475569; font-weight: bold; margin-bottom: 0.5rem; display: block; }
.parts-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.summary-row{display:flex;justify-content:space-between;margin-bottom:.75rem; font-size: 1.05rem;}
.highlight-total { color: #0b1680; font-weight: bold; border-top: 1px solid #e2e8f0; padding-top: 0.75rem; margin-top: 0.75rem; }
.empty-state{text-align:center;padding:2rem;color:#64748b;}

.dialog-form{display:flex;flex-direction:column;gap:1rem; padding-top: 0.5rem;}
.font-bold { font-weight: 700; color: #334155; }
.text-sm { font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.05em; }
.field{display:flex;flex-direction:column;gap:0.4rem;}
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.divider { border: none; border-top: 1px dashed #cbd5e1; margin: 0.5rem 0; }
.inventory-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-weight: bold; color: #1e293b; }
.part-row { display: grid; grid-template-columns: 1fr 110px 90px 40px; gap: 0.8rem; align-items: center; margin-bottom: 0.8rem; background: white; padding: 0.75rem; border-radius: 10px; border: 1px solid #e2e8f0; }
.part-select { width: 100%; }
.part-qty :deep(.p-inputnumber-input) { width: 100%; text-align: center; }
.part-subtotal { font-weight: 800; color: #0b1680; text-align: right; }
.part-trash { margin: 0 auto; }
.empty-parts { text-align: center; color: #94a3b8; font-size: 0.9rem; padding: 0.5rem 0; }
.total-preview { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; background: #eef2ff; border-radius: 12px; border: 1px solid #c7d2fe; margin-top: 0.5rem; }
.total-preview span { font-weight: bold; color: #4f46e5; text-transform: uppercase; font-size: 0.85rem; }
.total-preview h2 { margin: 0; color: #312e81; font-size: 1.5rem; }
.actions { display: flex; justify-content: flex-end; margin-top: 1rem; gap: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }

@media(min-width:900px){.mechanic-order-page{max-width:1000px;margin:auto;}}
.finish-order-btn{margin-top:1.5rem;width:100%; padding: 1rem;}
</style>