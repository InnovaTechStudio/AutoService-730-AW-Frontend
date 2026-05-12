<template>
  <div class="admin-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo-area">
        <img
            src="/AutoService-logo.jpg"
            alt="AutoService Logo"
            class="logo"
        />

        <div class="logo-text">
          <h2>AutoService</h2>
          <span class="subtitle">Panel Administrador</span>
        </div>
      </div>

      <nav class="menu">
        <router-link to="/" class="menu-item">
          <i class="pi pi-home"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/customers" class="menu-item">
          <i class="pi pi-users"></i>
          <span>Clientes</span>
        </router-link>

        <router-link to="/vehicles" class="menu-item">
          <i class="pi pi-car"></i>
          <span>Vehículos</span>
        </router-link>

        <router-link to="/work-orders" class="menu-item">
          <i class="pi pi-address-book"></i>
          <span>Órdenes de Trabajo</span>
        </router-link>

        <router-link to="/tasks" class="menu-item">
          <i class="pi pi-check-square"></i>
          <span>Tareas</span>
        </router-link>

        <router-link to="/mechanics" class="menu-item">
          <i class="pi pi-users"></i>
          <span>Mecánicos</span>
        </router-link>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="main-content">

      <!-- TOOLBAR -->
      <header class="topbar">

        <div class="topbar-left">

          <span class="welcome-text">
            Bienvenido,
            <strong>{{ authStore.user?.name || 'Administrador' }}</strong>
          </span>
        </div>

        <div class="topbar-right">

          <div class="user-info">
            <i class="pi pi-user user-icon"></i>
            <span>{{ authStore.user?.name || 'Administrador' }}</span>
          </div>

          <Button
              label="Cerrar Sesión"
              icon="pi pi-sign-out"
              severity="danger"
              rounded
              outlined
              @click="handleLogout"
          />
        </div>
      </header>

      <!-- CONTENT -->
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

/* LAYOUT */
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  color: white;
  display: flex;
  flex-direction: column;
}


.logo-area {
  padding: 1.5rem;
  border-bottom: 1px solid #1e293b;

  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-area h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.1;
}

.subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
}

.logo-area h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* MENU */
.menu {
  padding: 1rem 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 0.9rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;

  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #1e293b;
  color: white;
}

.router-link-exact-active {
  background: #1e293b;
  color: white;
  border-left: 4px solid #14b8a6;
}

/* MAIN */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}

/* TOPBAR */
.topbar {
  height: 70px;
  background: white;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 2rem;

  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.topbar-left {
  display: flex;
  flex-direction: column;
}

.topbar-left h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.welcome-text {
  font-size: 0.9rem;
  color: #64748b;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* USER INFO */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.user-icon {
  background: #14b8a6;
  color: white;

  width: 35px;
  height: 35px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
}

/* CONTENT */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

</style>