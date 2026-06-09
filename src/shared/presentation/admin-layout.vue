<script setup>
/**
 * Main admin layout.
 * Contains sidebar navigation, topbar and routed content.
 */

import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from 'primevue/button';

import { useAuthStore } from '../../domains/auth/application/auth.store';

import LanguageSwitcher from './language-switcher.vue';

const { t } = useI18n();

const router = useRouter();
const authStore = useAuthStore();

/**
 * Logs out current user and redirects to login page.
 */
const handleLogout = () => {
  authStore.logout();

  window.location.href = '/login';
};
</script>

<template>
  <div class="admin-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">

      <div class="logo-area">
        <h2>{{ t('layout.brand') }}</h2>

        <span class="subtitle">
          {{ t('nav.controlPanel') }}
        </span>
      </div>

      <nav class="menu">

        <router-link
            to="/"
            class="menu-item"
        >
          <i class="pi pi-home"></i>

          <span>{{ t('nav.dashboard') }}</span>
        </router-link>

        <router-link
            to="/customers"
            class="menu-item"
        >
          <i class="pi pi-users"></i>

          <span>{{ t('nav.customers') }}</span>
        </router-link>

        <router-link
            to="/vehicles"
            class="menu-item"
        >
          <i class="pi pi-car"></i>

          <span>{{ t('nav.vehicles') }}</span>
        </router-link>

        <router-link
            to="/work-orders"
            class="menu-item"
        >
          <i class="pi pi-address-book"></i>

          <span>{{ t('nav.workOrders') }}</span>
        </router-link>

        <router-link
            to="/tasks"
            class="menu-item"
        >
          <i class="pi pi-check-square"></i>

          <span>{{ t('nav.tasks') }}</span>
        </router-link>

        <router-link
            to="/mechanics"
            class="menu-item"
        >
          <i class="pi pi-users"></i>

          <span>{{ t('nav.mechanics') }}</span>
        </router-link>

        <router-link
            to="/inventory"
            class="menu-item"
        >
          <i class="pi pi-box"></i>

          <span>{{ t('nav.inventory') }}</span>
        </router-link>

      </nav>

    </aside>

    <!-- MAIN -->
    <main class="main-content">

      <!-- TOPBAR -->
      <header class="topbar">

        <div class="topbar-left">
          <span class="welcome-text">
            {{ t('topbar.welcome') }}

            <strong>
              {{ authStore.user?.name || t('topbar.admin') }}
            </strong>
          </span>
        </div>

        <div class="topbar-right">

          <LanguageSwitcher />

          <div class="user-info">

            <i class="pi pi-user user-icon"></i>

            <span>
              {{ authStore.user?.name || t('topbar.admin') }}
            </span>

          </div>

          <Button
              :label="t('topbar.logout')"
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

<style scoped>
/* Layout */
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  color: #ffffff;
  background: #0f172a;
}

.logo-area {
  padding: 1.8rem 1.5rem;
  border-bottom: 1px solid #1e293b;
}

.logo-area h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Menu */
.menu {
  flex: 1;
  padding: 1rem 0;
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
  color: #ffffff;
  background: #1e293b;
}

.router-link-exact-active {
  color: #ffffff;
  background: #1e293b;
  border-left: 4px solid #14b8a6;
}

/* Main */
.main-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  background: #f1f5f9;
}

/* Topbar */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  padding: 0 2rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topbar-left {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  color: #64748b;
  font-size: 0.9rem;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* User info */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  color: #ffffff;
  background: #14b8a6;
  border-radius: 50%;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
</style>