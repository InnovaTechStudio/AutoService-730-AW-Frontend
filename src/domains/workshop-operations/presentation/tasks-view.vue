<template>
  <div class="container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>{{ t('tasks.title') }}</h1>
      <Button icon="pi pi-refresh" rounded text @click="loadAllData" :loading="taskStore.loading" />
    </div>

    <div class="card bg-white p-3 border-round shadow-1">
      <DataTable :value="taskStore.tasks" :loading="taskStore.loading" dataKey="id" responsiveLayout="scroll" paginator :rows="10" sortField="status" :sortOrder="1">
        <Column :header="t('tasks.colOrder')">
          <template #body="slotProps">
            <Tag severity="secondary" :value="getWorkOrderCode(slotProps.data.workOrderId)" />
          </template>
        </Column>
        <Column field="description" :header="t('tasks.colDescription')"></Column>
        <Column :header="t('tasks.colMechanic')">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-user text-500"></i>
              <span>{{ getMechanicName(slotProps.data.mechanicId) }}</span>
            </div>
          </template>
        </Column>
        <Column field="status" :header="t('tasks.colStatus')" sortable>
          <template #body="slotProps">
            <Dropdown v-model="slotProps.data.status" :options="['Pendiente', 'En Proceso', 'Completada']" @change="onStatusChange(slotProps.data)" class="w-full" />
          </template>
        </Column>
        <Column :header="t('tasks.colActions')">
          <template #body="slotProps">
            <Button icon="pi pi-external-link" text rounded severity="info" v-tooltip.top="t('tasks.goToOrder')" @click="goToWorkOrder(slotProps.data.workOrderId)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTaskStore } from '../application/task.store';
import { useWorkOrderStore } from '../application/work-order.store';
import { useMechanicStore } from '../../staff-coordination/application/mechanic.store';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();
const taskStore = useTaskStore();
const workOrderStore = useWorkOrderStore();
const mechanicStore = useMechanicStore();

const loadAllData = async () => { await Promise.all([taskStore.fetchAllTasks(), workOrderStore.fetchWorkOrders(), mechanicStore.fetchMechanics()]); };
onMounted(() => loadAllData());

const getWorkOrderCode = (woId) => { if (!woId) return 'N/A'; const wo = workOrderStore.workOrders.find(w => String(w.id) === String(woId)); return wo ? wo.trackingCode : t('tasks.unknown'); };
const getMechanicName = (id) => { if (!id) return t('tasks.noAssigned'); const m = mechanicStore.mechanics.find(m => String(m.id) === String(id)); return m ? m.fullName : t('tasks.notFound'); };
const onStatusChange = async (task) => { await taskStore.updateTaskStatus(task.id, task.status); };
const goToWorkOrder = (woId) => { if (woId) router.push(`/work-orders/${woId}`); };
</script>
