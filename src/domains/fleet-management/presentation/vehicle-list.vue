<script setup>
import { ref, onMounted, computed } from 'vue';
import { useVehicleStore } from '../application/vehicle.store';
import { useCustomerStore } from '../../customer-management/application/customer.store';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

import VehicleFilters from './components/VehicleFilters.vue';
import VehicleCard from './components/VehicleCard.vue';

const vehicleStore = useVehicleStore();
const customerStore = useCustomerStore();

const vehicleDialog = ref(false);
const vehicle = ref({});
const search = ref('');
const selectedStatus = ref(null);

const statusOptions = [
  { label: 'En Taller', value: 'En Taller' },
  { label: 'Listo', value: 'Listo' },
  { label: 'Entregado', value: 'Entregado' }
];

const carImages = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop'
];

onMounted(async () => {
  await customerStore.fetchCustomers();
  await vehicleStore.fetchVehicles();
});

const getCustomerName = (id) => {
  const customer = customerStore.customers.find((customer) => String(customer.id) === String(id));
  return customer ? customer.fullName : 'No asignado';
};

const getSeverity = (status) => {
  switch (status) {
    case 'En Taller':
      return 'info';
    case 'Listo':
      return 'success';
    case 'Entregado':
      return 'secondary';
    default:
      return 'warning';
  }
};

const getProgress = (status) => {
  switch (status) {
    case 'En Taller':
      return 65;
    case 'Listo':
      return 100;
    case 'Entregado':
      return 100;
    default:
      return 15;
  }
};

const vehiclesView = computed(() =>
    vehicleStore.vehicles.map((item, index) => ({
      id: item.id,
      raw: item,
      name: `${item.brand || 'Vehículo'} ${item.model || ''}`,
      plate: item.plate || 'Sin placa',
      owner: getCustomerName(item.customerId),
      status: item.status || 'Pendiente',
      severity: getSeverity(item.status),
      progress: getProgress(item.status),
      year: item.year || 'N/A',
      color: item.color || 'N/A',
      image: item.image || carImages[index % carImages.length]
    }))
);

const filteredVehicles = computed(() => {
  const term = search.value.toLowerCase().trim();

  return vehiclesView.value.filter((item) => {
    const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.plate.toLowerCase().includes(term) ||
        item.owner.toLowerCase().includes(term);

    const matchesStatus =
        !selectedStatus.value || item.status === selectedStatus.value;

    return matchesSearch && matchesStatus;
  });
});

const openNew = () => {
  vehicle.value = {
    status: 'En Taller',
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    image: '',
    customerId: null
  };

  vehicleDialog.value = true;
};

const hideDialog = () => {
  vehicleDialog.value = false;
};

const editVehicle = (selectedVehicle) => {
  vehicle.value = { ...selectedVehicle };
  vehicleDialog.value = true;
};

const saveVehicle = async () => {
  if (vehicle.value.plate && vehicle.value.customerId) {
    if (vehicle.value.id) {
      await vehicleStore.updateVehicle(vehicle.value.id, vehicle.value);
    } else {
      await vehicleStore.addVehicle(vehicle.value);
    }

    vehicleDialog.value = false;
    vehicle.value = {};
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    vehicle.value.image = reader.result;
  };

  reader.readAsDataURL(file);
};

</script>

<template>
  <section class="vehicle-page">
    <div class="vehicle-header">
      <div>
        <span class="eyebrow">Gestión de flota</span>
        <h1>Vehículos registrados</h1>
        <p>
          Consulta, filtra y administra los vehículos vinculados a servicios activos del taller.
        </p>
      </div>

      <Button
          label="Agregar vehículo"
          icon="pi pi-plus"
          class="add-button"
          @click="openNew"
      />
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <span>Total registrados</span>
        <strong>{{ vehicleStore.vehicles.length }}</strong>
      </div>

      <div class="summary-card">
        <span>En taller</span>
        <strong>{{ vehicleStore.vehicles.filter(v => v.status === 'En Taller').length }}</strong>
      </div>

      <div class="summary-card">
        <span>Listos</span>
        <strong>{{ vehicleStore.vehicles.filter(v => v.status === 'Listo').length }}</strong>
      </div>
    </div>

    <VehicleFilters
        v-model:search="search"
        v-model:status="selectedStatus"
        :status-options="statusOptions"
    />

    <div v-if="vehicleStore.loading" class="empty-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando vehículos...</p>
    </div>

    <div v-else-if="filteredVehicles.length" class="vehicles-grid">
      <VehicleCard
          v-for="item in filteredVehicles"
          :key="item.id"
          :vehicle="item"
          @edit="editVehicle"
      />
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-car"></i>
      <h3>No se encontraron vehículos</h3>
      <p>Prueba cambiando el filtro o registra un nuevo vehículo.</p>
    </div>

    <Dialog
        v-model:visible="vehicleDialog"
        :header="vehicle.id ? 'Editar vehículo' : 'Nuevo vehículo'"
        :modal="true"
        class="vehicle-dialog p-fluid"
    >
      <div class="field">
        <label for="customer">Cliente dueño</label>
        <Dropdown
            id="customer"
            v-model="vehicle.customerId"
            :options="customerStore.customers"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Selecciona un cliente"
            filter
        />
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="plate">Placa</label>
          <InputText id="plate" v-model.trim="vehicle.plate" required />
        </div>

        <div class="field col">
          <label for="status">Estado</label>
          <Dropdown
              id="status"
              v-model="vehicle.status"
              :options="['En Taller', 'Listo', 'Entregado']"
              placeholder="Estado"
          />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="brand">Marca</label>
          <InputText id="brand" v-model.trim="vehicle.brand" />
        </div>

        <div class="field col">
          <label for="model">Modelo</label>
          <InputText id="model" v-model.trim="vehicle.model" />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="year">Año</label>
          <InputText id="year" v-model.trim="vehicle.year" placeholder="Ej: 2024" />
        </div>

        <div class="field col">
          <label for="color">Color</label>
          <InputText id="color" v-model.trim="vehicle.color" placeholder="Ej: Azul" />
        </div>
      </div>

      <div class="field">
        <label for="image">Imagen del vehículo</label>

        <InputText
            id="image"
            v-model.trim="vehicle.image"
            placeholder="https://..."
        />
        <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
        />

        <img
            v-if="vehicle.image"
            :src="vehicle.image"
            alt="Vista previa"
            class="vehicle-preview"
        />
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveVehicle" />
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.vehicle-page {
  min-height: 100%;
}

.vehicle-header {
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

.vehicle-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.vehicle-header p {
  max-width: 620px;
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

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.vehicle-dialog {
  width: min(620px, 92vw);
}
.vehicle-preview {
  width: 100%;
  height: 190px;
  margin-top: 1rem;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}
@media (max-width: 1100px) {
  .vehicles-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vehicle-header {
    flex-direction: column;
  }

  .add-button {
    width: 100%;
  }

  .summary-row {
    grid-template-columns: 1fr;
  }
}
</style>