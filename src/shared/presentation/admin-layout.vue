<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo-area">
        <h2>AutoService</h2>
        <span class="subtitle">Panel de Control</span>
      </div>
      <nav class="menu">
        <router-link to="/" class="menu-item">
          <i class="pi pi-home"></i> Dashboard
        </router-link>
        <router-link to="/customers" class="menu-item">
          <i class="pi pi-users"></i> Clientes
        </router-link>
        <router-link to="/vehicles" class="menu-item">
          <i class="pi pi-car"></i> Vehículos
        </router-link>
        <router-link to="/work-orders" class="menu-item">
          <i class="pi pi-address-book"></i> Órdenes de Trabajo
        </router-link>
        <router-link to="/tasks" class="menu-item">
          <i class="pi pi-check-square"></i> Tareas
        </router-link>
        <router-link to="/mechanics" class="menu-item">
          <i class="pi pi-users"></i> Mecánicos
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar flex justify-content-between align-items-center px-4">
        <div class="welcome-msg">
          <span class="text-600">Bienvenido al Taller, </span>
          <span class="font-bold text-900">{{ authStore.user?.name || 'Administrador' }}</span>
        </div>

        <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            severity="danger"
            text
            @click="handleLogout"
        />
      </header>

      <section class="content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../domains/auth/application/auth.store';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {

  authStore.logout();


  router.push('/login');
};
</script>

<style scoped>

.admin-layout { display: flex; height: 100vh; }
.sidebar { width: 260px; background-color: #1e293b; color: white; display: flex; flex-direction: column; }
.logo-area { padding: 1.5rem; border-bottom: 1px solid #334155; }
.menu { flex: 1; padding: 1rem 0; }
.menu-item { padding: 0.75rem 1.5rem; color: #cbd5e1; text-decoration: none; display: flex; align-items: center; gap: 10px; }
.menu-item:hover, .router-link-exact-active { background-color: #334155; color: white; border-left: 4px solid #00BFA5; }

.main-content { flex: 1; display: flex; flex-direction: column; background-color: #f8fafc; }
.topbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}
.content { padding: 2rem; overflow-y: auto; }
</style>