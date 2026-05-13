<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../auth/application/auth.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';
import { useWorkOrderStore } from '../../workshop-operations/application/work-order.store';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import ProgressBar from 'primevue/progressbar';
import Avatar from 'primevue/avatar';

const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const workOrderStore = useWorkOrderStore();

const selectedTask = ref(null);
const selectedStatus = ref(null);
const mechanicReports = reactive({});

const statusOptions = [
  { label: 'Todas', value: null },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'Completada', value: 'Completada' }
];

onMounted(async () => {
  const mechanicId = authStore.mechanicId || authStore.user?.mechanicId || 'M-1';

  await Promise.all([
    taskStore.fetchTasksByMechanic(mechanicId),
    workOrderStore.fetchWorkOrders()
  ]);
});

const myTasks = computed(() => taskStore.tasks);

const filteredTasks = computed(() => {
  if (!selectedStatus.value) return myTasks.value;
  return myTasks.value.filter(task => task.status === selectedStatus.value);
});

const pendingTasks = computed(() => myTasks.value.filter(t => t.status === 'Pendiente').length);
const progressTasks = computed(() => myTasks.value.filter(t => t.status === 'En Proceso').length);
const completedTasks = computed(() => myTasks.value.filter(t => t.status === 'Completada').length);

const generalProgress = computed(() => {
  if (!myTasks.value.length) return 0;
  return Math.round((completedTasks.value / myTasks.value.length) * 100);
});

const getOrder = (workOrderId) => {
  return workOrderStore.workOrders.find(order => String(order.id) === String(workOrderId));
};

const getOrderCode = (workOrderId) => {
  return getOrder(workOrderId)?.trackingCode || 'Sin orden';
};

const getSeverity = (status) => {
  if (status === 'Completada') return 'success';
  if (status === 'En Proceso') return 'info';
  return 'warning';
};

const getIconClass = (status) => {
  if (status === 'Completada') return 'pi pi-check-circle';
  if (status === 'En Proceso') return 'pi pi-cog';
  return 'pi pi-clock';
};

const getReport = (task) => {
  if (!mechanicReports[task.id]) {
    mechanicReports[task.id] = {
      technicalDiagnosis: task.technicalDiagnosis || '',
      customerExplanation: task.customerExplanation || '',
      internalObservation: task.internalObservation || '',
      evidenceRegistered: task.evidenceRegistered || ''
    };
  }

  return mechanicReports[task.id];
};

const selectTask = (task) => {
  selectedTask.value = task;
  getReport(task);
};

const startTask = async (task) => {
  await taskStore.updateTaskStatus(task.id, 'En Proceso');
  task.status = 'En Proceso';
};

const saveTechnicalReport = async () => {
  if (!selectedTask.value) return;

  await taskStore.updateMechanicTechnicalReport(
      selectedTask.value.id,
      getReport(selectedTask.value)
  );

  alert('Actualización técnica enviada al administrador');
};

const completeTask = async () => {
  if (!selectedTask.value) return;

  await taskStore.completeTaskFromMechanic(
      selectedTask.value.id,
      getReport(selectedTask.value)
  );

  selectedTask.value.status = 'Completada';
  alert('Tarea completada y visible para el cliente');
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <section class="mechanic-page">
    <header class="mechanic-header">
      <div>
        <span class="eyebrow">Workspace del Mecánico</span>
        <h1>Mis tareas asignadas</h1>
        <p>Registra diagnósticos técnicos, actualiza avances y genera información clara para el Cliente.</p>
      </div>

      <Card class="profile-card">
        <template #content>
          <div class="profile-content">
            <Avatar icon="pi pi-users" size="large" shape="circle" />
            <div>
              <strong>{{ authStore.user?.name || 'Roberto Sánchez' }}</strong>
              <span>Mecánico General</span>
              <small>Turno activo</small>
            </div>
          </div>
        </template>
      </Card>
    </header>

    <section class="summary-grid">
      <Card class="summary-card">
        <template #content>
          <span>Pendientes</span>
          <strong>{{ pendingTasks }}</strong>
          <small>Tareas por iniciar</small>
        </template>
      </Card>

      <Card class="summary-card">
        <template #content>
          <span>En proceso</span>
          <strong>{{ progressTasks }}</strong>
          <small>Trabajo activo</small>
        </template>
      </Card>

      <Card class="summary-card">
        <template #content>
          <span>Completadas</span>
          <strong>{{ completedTasks }}</strong>
          <small>Listas para revisión</small>
        </template>
      </Card>

      <Card class="summary-card progress-card">
        <template #content>
          <div class="progress-head">
            <span>Avance general</span>
            <strong>{{ generalProgress }}%</strong>
          </div>
          <ProgressBar :value="generalProgress" :showValue="false" class="general-progress" />
        </template>
      </Card>
    </section>

    <section class="workspace-grid">
      <Card class="tasks-panel">
        <template #content>
          <div class="panel-header">
            <div>
              <h2>Tareas del día</h2>
              <p>Filtra y actualiza el estado real del servicio.</p>
            </div>

            <Dropdown
                v-model="selectedStatus"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="Filtrar estado"
                class="status-filter"
            />
          </div>

          <div class="task-list">
            <article
                v-for="task in filteredTasks"
                :key="task.id"
                :class="['mini-task-card', { active: selectedTask?.id === task.id }]"
                @click="selectTask(task)"
            >
              <div class="task-icon">
                <i :class="getIconClass(task.status)"></i>
              </div>

              <div class="mini-task-content">
                <Tag :value="getOrderCode(task.workOrderId)" severity="secondary" rounded />
                <h3>{{ task.description }}</h3>
                <p>Orden asociada al servicio técnico del vehículo.</p>

                <div class="mini-meta">
                  <span><i class="pi pi-flag"></i>{{ task.priority || 'Media' }}</span>
                  <span><i class="pi pi-clock"></i>{{ task.estimatedTime || '2 h estimadas' }}</span>
                </div>

                <Tag :value="task.status" :severity="getSeverity(task.status)" rounded />
              </div>

              <Button
                  label="Trabajar"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  outlined
                  rounded
                  @click.stop="selectTask(task)"
              />
            </article>
          </div>
        </template>
      </Card>

      <Card class="detail-panel">
        <template #content>
          <div v-if="!selectedTask" class="empty-detail">
            <i class="pi pi-users"></i>
            <h2>Selecciona una tarea</h2>
            <p>Aquí registrarás el diagnóstico técnico, la explicación para el Cliente, observaciones internas y evidencia simulada.</p>
          </div>

          <div v-else class="task-detail">
            <div class="detail-header">
              <div>
                <Tag :value="getOrderCode(selectedTask.workOrderId)" severity="secondary" rounded />
                <h2>{{ selectedTask.description }}</h2>
                <p>Estado actual del servicio técnico.</p>
              </div>

              <Tag :value="selectedTask.status" :severity="getSeverity(selectedTask.status)" rounded />
            </div>

            <div class="detail-actions">
              <Button
                  v-if="selectedTask.status === 'Pendiente'"
                  label="Iniciar tarea"
                  icon="pi pi-play"
                  severity="warning"
                  outlined
                  @click="startTask(selectedTask)"
              />

              <Button
                  label="Ver orden"
                  icon="pi pi-external-link"
                  outlined
                  @click="router.push(`/work-orders/${selectedTask.workOrderId}`)"
              />
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Diagnóstico técnico</label>
                <Textarea
                    v-model="getReport(selectedTask).technicalDiagnosis"
                    rows="4"
                    autoResize
                    placeholder="Ejemplo: desgaste en pastillas delanteras..."
                />
              </div>

              <div class="field">
                <label>Explicación para Cliente</label>
                <Textarea
                    v-model="getReport(selectedTask).customerExplanation"
                    rows="4"
                    autoResize
                    placeholder="Ejemplo: se recomienda cambio por seguridad..."
                />
              </div>

              <div class="field">
                <label>Observación interna para Administrador</label>
                <Textarea
                    v-model="getReport(selectedTask).internalObservation"
                    rows="3"
                    autoResize
                    placeholder="Observaciones internas para coordinación..."
                />
              </div>

              <div class="field">
                <label>Evidencia simulada</label>
                <InputText
                    v-model="getReport(selectedTask).evidenceRegistered"
                    placeholder="Ejemplo: Foto de fuga hidráulica registrada"
                />
              </div>
            </div>

            <div class="save-row">
              <Button
                  label="Guardar actualización"
                  icon="pi pi-save"
                  severity="info"
                  outlined
                  @click="saveTechnicalReport"
              />

              <Button
                  label="Completar tarea"
                  icon="pi pi-check"
                  severity="success"
                  @click="completeTask"
              />
            </div>
          </div>
        </template>
      </Card>
    </section>

    <Button
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        severity="danger"
        outlined
        class="logout-button"
        @click="logout"
    />
  </section>
</template>

<style scoped>
.mechanic-page {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
  color: #0f172a;
}

.mechanic-header {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 1.5rem;
}

.eyebrow {
  color: #0b1680;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.mechanic-header h1 {
  margin: .3rem 0;
  font-size: clamp(2.2rem, 5vw, 3.3rem);
  line-height: 1;
  letter-spacing: -0.05em;
}

.mechanic-header p {
  color: #64748b;
  font-size: 1rem;
}

.profile-card,
.summary-card,
.tasks-panel,
.detail-panel {
  border-radius: 26px;
  border: 1px solid #edf2f7;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.profile-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.profile-content strong,
.profile-content span,
.profile-content small {
  display: block;
}

.profile-content strong {
  color: #0f172a;
}

.profile-content span {
  color: #64748b;
}

.profile-content small {
  margin-top: .25rem;
  color: #16a34a;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.summary-card span {
  color: #64748b;
  font-weight: 800;
}

.summary-card strong {
  display: block;
  margin: .35rem 0;
  color: #0b1680;
  font-size: 2.2rem;
  line-height: 1;
}

.summary-card small {
  color: #94a3b8;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.general-progress {
  height: 8px;
  margin-top: 1rem;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1.25fr .75fr;
  gap: 1.5rem;
  align-items: start;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  margin: 0;
  color: #0f172a;
}

.panel-header p {
  margin: .35rem 0 0;
  color: #64748b;
}

.status-filter {
  width: 200px;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.1rem;
}

.mini-task-card {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  border: 1px solid #e8edf5;
  border-radius: 22px;
  background: #ffffff;
  cursor: pointer;
  transition: .2s ease;
}

.mini-task-card:hover,
.mini-task-card.active {
  border-color: #0b1680;
  box-shadow: 0 14px 28px rgba(11, 22, 128, 0.09);
  transform: translateY(-2px);
}

.task-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #dbeafe;
  color: #0b1680;
  font-size: 1.2rem;
}

.mini-task-content h3 {
  margin: .5rem 0 .25rem;
  font-size: 1rem;
  color: #0f172a;
}

.mini-task-content p {
  margin: 0 0 .8rem;
  color: #64748b;
  font-size: .9rem;
}

.mini-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem;
  margin-bottom: .8rem;
  color: #64748b;
  font-size: .85rem;
}

.mini-meta span {
  display: inline-flex;
  gap: .35rem;
  align-items: center;
}

.detail-panel {
  min-height: 520px;
  position: sticky;
  top: 1rem;
}

.empty-detail {
  min-height: 450px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #64748b;
}

.empty-detail i {
  color: #0b1680;
  font-size: 2.5rem;
}

.empty-detail h2 {
  margin: .75rem 0 .25rem;
  color: #0f172a;
}

.empty-detail p {
  max-width: 390px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-header h2 {
  margin: .65rem 0 .25rem;
  color: #0f172a;
}

.detail-header p {
  margin: 0;
  color: #64748b;
}

.detail-actions {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.field label {
  display: block;
  margin-bottom: .45rem;
  color: #64748b;
  font-weight: 800;
}

.field :deep(textarea),
.field :deep(input) {
  width: 100%;
  border-radius: 14px;
}

.save-row {
  display: flex;
  gap: .75rem;
  margin-top: 1.3rem;
  flex-wrap: wrap;
}

.logout-button {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  border-radius: 16px;
  background: #ffffff;
}

@media (max-width: 1200px) {
  .mechanic-header,
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    position: static;
  }
}

@media (max-width: 900px) {
  .summary-grid,
  .task-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .mini-task-card {
    grid-template-columns: 44px 1fr;
  }

  .mini-task-card .p-button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .mechanic-page {
    padding: 1rem;
  }

  .summary-grid,
  .task-list {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
  }

  .status-filter {
    width: 100%;
  }

  .logout-button {
    position: static;
    width: 100%;
    margin-top: 1rem;
  }
}
</style>