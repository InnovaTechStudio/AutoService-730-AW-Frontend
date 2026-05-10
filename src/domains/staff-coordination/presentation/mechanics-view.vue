<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMechanicStore } from '../application/mechanic.store';
import { useTaskStore } from '../../workshop-operations/application/task.store';

import Button from 'primevue/button';

import MechanicFilters from './components/MechanicFilters.vue';
import MechanicCard from './components/MechanicCard.vue';
import MechanicDialog from './components/MechanicDialog.vue';

const mechanicStore = useMechanicStore();
const taskStore = useTaskStore();

const displayDialog = ref(false);
const mechanicForm = ref({});
const search = ref('');
const selectedSpecialty = ref(null);

const specialtyOptions = [
  'Mecánica General',
  'Electricidad',
  'Planchado y Pintura',
  'Electrónica',
  'Frenos y Suspensión',
  'Motor y Transmisión'
];

onMounted(async () => {
  await Promise.all([
    mechanicStore.fetchMechanics(),
    taskStore.fetchAllTasks()
  ]);
});

const getActiveTasksCount = (mechanicId) =>
    taskStore.tasks.filter((task) =>
        String(task.mechanicId) === String(mechanicId) &&
        task.status !== 'Completada'
    ).length;

const calculateLoadPercentage = (mechanicId, maxCapacity) => {
  const max = Number(maxCapacity) || 1;
  const count = getActiveTasksCount(mechanicId);
  return Math.min(Math.round((count / max) * 100), 100);
};

const getWorkloadStatus = (mechanicId, maxCapacity) => {
  const percentage = calculateLoadPercentage(mechanicId, maxCapacity);

  if (percentage >= 100) return 'Al máximo';
  if (percentage >= 70) return 'Carga alta';
  return 'Disponible';
};

const getSeverity = (mechanicId, maxCapacity) => {
  const percentage = calculateLoadPercentage(mechanicId, maxCapacity);

  if (percentage >= 100) return 'danger';
  if (percentage >= 70) return 'warning';
  return 'success';
};

const getLoadClass = (mechanicId, maxCapacity) => {
  const percentage = calculateLoadPercentage(mechanicId, maxCapacity);

  if (percentage >= 100) return 'load-high';
  if (percentage >= 70) return 'load-medium';
  return 'load-low';
};

const calculateEffectiveness = (mechanicId) => {
  const mechanicTasks = taskStore.tasks.filter((task) =>
      String(task.mechanicId) === String(mechanicId)
  );

  if (!mechanicTasks.length) return 0;

  const completed = mechanicTasks.filter((task) =>
      ['Completada', 'Finalizada', 'Listo'].includes(task.status)
  ).length;

  return Math.round((completed / mechanicTasks.length) * 100);
};

const mechanicsView = computed(() =>
    mechanicStore.mechanics.map((mechanic) => ({
      id: mechanic.id,
      raw: mechanic,
      fullName: mechanic.fullName,
      specialty: mechanic.specialty || 'Mecánica General',
      maxCapacity: mechanic.maxCapacity || 5,
      activeTasks: getActiveTasksCount(mechanic.id),
      loadPercentage: calculateLoadPercentage(mechanic.id, mechanic.maxCapacity),
      workloadStatus: getWorkloadStatus(mechanic.id, mechanic.maxCapacity),
      severity: getSeverity(mechanic.id, mechanic.maxCapacity),
      loadClass: getLoadClass(mechanic.id, mechanic.maxCapacity),
      effectiveness: calculateEffectiveness(mechanic.id)
    }))
);

const filteredMechanics = computed(() => {
  const term = search.value.toLowerCase().trim();

  return mechanicsView.value.filter((mechanic) => {
    const matchesSearch =
        !term ||
        mechanic.fullName.toLowerCase().includes(term) ||
        mechanic.specialty.toLowerCase().includes(term);

    const matchesSpecialty =
        !selectedSpecialty.value || mechanic.specialty === selectedSpecialty.value;

    return matchesSearch && matchesSpecialty;
  });
});

const availableMechanics = computed(() =>
    mechanicsView.value.filter((mechanic) => mechanic.loadPercentage < 70).length
);

const highLoadMechanics = computed(() =>
    mechanicsView.value.filter((mechanic) => mechanic.loadPercentage >= 70).length
);

const openDialog = () => {
  mechanicForm.value = {
    fullName: '',
    specialty: 'Mecánica General',
    maxCapacity: 5
  };

  displayDialog.value = true;
};

const editMechanic = (mechanic) => {
  mechanicForm.value = { ...mechanic };
  displayDialog.value = true;
};

const hideDialog = () => {
  displayDialog.value = false;
  mechanicForm.value = {};
};

const saveMechanic = async () => {
  if (!mechanicForm.value.fullName) return;

  if (mechanicForm.value.id) {
    await mechanicStore.updateMechanic(mechanicForm.value.id, mechanicForm.value);
  } else {
    await mechanicStore.addMechanic(mechanicForm.value);
  }

  hideDialog();
};

const deleteMechanic = async (mechanic) => {
  const confirmed = window.confirm(`¿Eliminar a ${mechanic.fullName}?`);

  if (!confirmed) return;

  await mechanicStore.deleteMechanic(mechanic.id);
};
</script>

<template>
  <section class="mechanics-page">
    <div class="mechanics-header">
      <div>
        <span class="eyebrow">Coordinación de staff</span>
        <h1>Gestión de mecánicos</h1>
        <p>
          Administra especialidades, disponibilidad y carga laboral para asignar tareas con mayor precisión.
        </p>
      </div>

      <Button
          label="Registrar mecánico"
          icon="pi pi-user-plus"
          class="add-button"
          @click="openDialog"
      />
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <span>Total mecánicos</span>
        <strong>{{ mechanicStore.mechanics.length }}</strong>
      </div>

      <div class="summary-card">
        <span>Disponibles</span>
        <strong>{{ availableMechanics }}</strong>
      </div>

      <div class="summary-card warning">
        <span>Carga alta</span>
        <strong>{{ highLoadMechanics }}</strong>
      </div>
    </div>

    <MechanicFilters
        v-model:search="search"
        v-model:specialty="selectedSpecialty"
        :specialty-options="specialtyOptions"
    />

    <div v-if="mechanicStore.loading" class="empty-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando mecánicos...</p>
    </div>

    <div v-else-if="filteredMechanics.length" class="mechanics-grid">
      <MechanicCard
          v-for="mechanic in filteredMechanics"
          :key="mechanic.id"
          :mechanic="mechanic"
          @edit="editMechanic"
          @delete="deleteMechanic"
      />
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-users"></i>
      <h3>No se encontraron mecánicos</h3>
      <p>Prueba cambiando el filtro o registra un nuevo integrante.</p>
    </div>

    <MechanicDialog
        v-model:visible="displayDialog"
        :mechanic="mechanicForm"
        :specialty-options="specialtyOptions"
        @save="saveMechanic"
        @cancel="hideDialog"
    />
  </section>
</template>

<style scoped>
.mechanics-page {
  min-height: 100%;
}

.mechanics-header {
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

.mechanics-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.mechanics-header p {
  max-width: 680px;
  margin: 0.75rem 0 0;
  color: #64748b;
}

.add-button {
  background: #0b1680;
  border-color: #0b1680;
  border-radius: 14px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

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

.summary-card.warning strong {
  color: #c2410c;
}

.mechanics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 260px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 24px;
  background: #ffffff;
}

.empty-state i {
  color: #0b1680;
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.empty-state h3 {
  margin: 0;
  color: #0f172a;
}

@media (max-width: 1200px) {
  .mechanics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .mechanics-header {
    flex-direction: column;
  }

  .add-button {
    width: 100%;
  }

  .summary-row,
  .mechanics-grid {
    grid-template-columns: 1fr;
  }
}
</style>