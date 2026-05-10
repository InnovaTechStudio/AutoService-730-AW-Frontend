<template>
  <div class="login-layout">
    <div class="hero-section">
      <div class="hero-content">
        <h1>{{t('app.name')}}</h1>
        <p>{{t('app.tagline')}}</p>
      </div>
    </div>

    <div class="form-section">
      <div class="login-box">
        <div class="lang-top">
          <LanguageSwitcher />
        </div>
        <div class="login-header">
          <h2>{{(t('auth.title'))}}</h2>
          <span class="badge">{{t('auth.badge')}}</span>
          <p>{{t('auth.subtitle')}}</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="email">{{t('auth.email')}}</label>
            <InputText id="email" v-model="email" type="email" placeholder="admin@autoservice.com" />
          </div>

          <div class="input-group">
            <label for="password">{{t('auth.password')}}</label>
            <Password id="password" v-model="password" :feedback="false" toggleMask :placeholder="t('auth.passwordPlaceholder')" />
          </div>

          <div v-if="authStore.error" class="error-message">
            <i class="pi pi-exclamation-circle"></i> {{ authStore.error }}
          </div>

          <Button type="submit" :label="t('auth.loginButton')" :loading="authStore.loading" class="p-button-primary w-full mt-3" />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {useI18n} from 'vue-i18n';
import LanguageSwitcher from "../../../shared/presentation/language-switcher.vue";

import { useAuthStore } from '../application/auth.store';

import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const {t} = useI18n();
const router = useRouter();
const authStore = useAuthStore();


const email = ref('admin@autoservice.com');
const password = ref('admin');

const handleLogin = async () => {
  if (!email.value || !password.value) return;


  const success = await authStore.login(email.value, password.value);

  if (success) {

    router.push('/');
  }
};
</script>

<style scoped>
.login-layout { display: flex; height: 100vh; width: 100vw; font-family: system-ui, -apple-system, sans-serif; }
.hero-section { flex: 1; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.hero-content h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 0.5rem; }
.hero-content p { font-size: 1.2rem; opacity: 0.9; }
.form-section { flex: 1; display: flex; align-items: center; justify-content: center; background-color: #f8fafc; }
.login-box { width: 100%; max-width: 420px; background: white; padding: 2.5rem 3rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
.lang-top { display: flex; justify-content: flex-end; margin-bottom: 1.5rem; }
.login-header { margin-bottom: 2rem; text-align: center; }
.login-header h2 { font-size: 1.8rem; color: #1e293b; margin: 0 0 0.5rem 0; }
.badge { background: #e2e8f0; color: #475569; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; display: inline-block; margin-bottom: 1rem; }
.login-header p { color: #64748b; font-size: 0.95rem; }
.login-form { display: flex; flex-direction: column; gap: 1.5rem; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.error-message { color: #dc2626; background-color: #fef2f2; padding: 0.75rem; border-radius: 6px; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid #fecaca; }
.tracking-link { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; }
.tracking-link a { color: #3b82f6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; }
.tracking-link a:hover { text-decoration: underline; }
:deep(.p-inputtext), :deep(.p-password) { width: 100%; }
:deep(.p-password-input) { width: 100%; }
.w-full { width: 100%; }
.mt-3 { margin-top: 1rem; }
@media (max-width: 768px) { .hero-section { display: none; } }
</style>
