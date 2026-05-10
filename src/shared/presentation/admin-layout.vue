<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo-area">
        <h2>{{t('app.name')}}</h2>
        <span class="subtitle">{{t('app.tagline')}}</span>
      </div>
      <nav class="menu">
        <router-link to="/" class="menu-item">
          <i class="pi pi-home"></i> {{t('app.dasshboard')}}
        </router-link>
        <router-link to="/customers" class="menu-item">
          <i class="pi pi-users"></i> {{t('nav.customers')}}
        </router-link>
        <router-link to="/vehicles" class="menu-item">
          <i class="pi pi-car"></i> {{t('nav.vehicles')}}
        </router-link>
        <router-link to="/work-orders" class="menu-item">
          <i class="pi pi-address-book"></i> {{t('nav.workOrders')}}
        </router-link>
        <router-link to="/tasks" class="menu-item">
          <i class="pi pi-check-square"></i> {{t('nav.tasks')}}
        </router-link>
        <router-link to="/mechanics" class="menu-item">
          <i class="pi pi-users"></i> {{t('nav.mechanics')}}
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar flex justify-content-between align-items-center px-4">
        <div class="welcome-msg">
          <span class="text-600">{{t('layout.welcome')}}</span>
          <span class="font-bold text-900">{{ authStore.user?.name || t('layout.admin') }}</span>
        </div>
        <div class="topbar-right">
          <LanguageSwitcher />
          <Button
              :label="t('layout.logout')"
              icon="pi pi-sign-out"
              severity="danger"
              text
              @click="handleLogout"
          />
        </div>
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
import {useI18n} from 'vue-i18n';
import LanguageSwitcher from "./language-switcher.vue";

const {t} = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {

  authStore.logout();


  router.push('/login');
};
</script>

<style scoped>
.admin-layout { display: flex; height: 100vh; }
.sidebar { width: 260px; background-color: #1e293b; color: white; display: flex; flex-direction: column; flex-shrink: 0; }
.logo-area { padding: 1.5rem; border-bottom: 1px solid #334155; }
.logo-area h2 { margin: 0 0 0.2rem 0; font-size: 1.4rem; }
.subtitle { font-size: 0.75rem; color: #94a3b8; }
.menu { flex: 1; padding: 1rem 0; }
.menu-item { padding: 0.75rem 1.5rem; color: #cbd5e1; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: all 0.15s; }
.menu-item:hover, .router-link-exact-active { background-color: #334155; color: white; border-left: 4px solid #00BFA5; }
.main-content { flex: 1; display: flex; flex-direction: column; background-color: #f8fafc; overflow: hidden; }
.topbar { height: 60px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; padding: 0 1.5rem; }
.topbar-right { display: flex; align-items: center; gap: 1rem; }
.content { padding: 2rem; overflow-y: auto; flex: 1; }
</style>