<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../application/auth.store';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import LanguageSwitcher from '../../../shared/presentation/language-switcher.vue';

/**
 * Login/Register component.
 * Handles authentication flow for workshop registration and login.
 */
const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const isRegister = ref(false);

const form = ref({
  workshopName: '',
  email: '',
  password: ''
});

/**
 * Handles form submission for login or workshop registration.
 */
const handleSubmit = async () => {
  if (!form.value.email || !form.value.password) return;

  if (isRegister.value) {
    if (!form.value.workshopName) return;
    const success = await authStore.registerWorkshop(form.value.workshopName, form.value.email, form.value.password);
    if (success) {
      await authStore.login(form.value.email, form.value.password);
      router.push('/');
    }
  } else {
    const success = await authStore.login(form.value.email, form.value.password);
    if (success) {
      if (authStore.user?.role === 'mechanic') {
        router.push('/mechanic/workspace');
      } else {
        router.push('/');
      }
    }
  }
};
</script>

<template>
  <div class="login-layout">
    <div class="hero-section">
      <div class="hero-content">
        <h1>{{ isRegister ? t('login.registerHeroTitle') : t('login.title') }}</h1>
        <p>{{ isRegister ? t('login.registerHeroSubtitle') : t('login.subtitle') }}</p>
      </div>
    </div>

    <div class="form-section">
      <div class="login-box">
        <div class="lang-switcher-wrapper">
          <LanguageSwitcher />
        </div>

        <div class="login-header">
          <h2>{{ isRegister ? t('login.registerTitle') : t('login.welcome') }}</h2>
          <p>{{ isRegister ? t('login.registerDescription') : t('login.description') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="input-group" v-if="isRegister">
            <label for="workshopName">{{ t('login.workshopName') }}</label>
            <InputText id="workshopName" v-model="form.workshopName" :placeholder="t('login.workshopPlaceholder')" />
          </div>

          <div class="input-group">
            <label for="email">{{ t('login.email') }}</label>
            <InputText id="email" v-model="form.email" type="email" :placeholder="t('login.emailPlaceholder')" />
          </div>

          <div class="input-group">
            <label for="password">{{ t('login.password') }}</label>
            <Password id="password" v-model="form.password" :feedback="false" toggleMask :placeholder="t('login.passwordPlaceholder')" />
          </div>

          <div v-if="authStore.error" class="error-message">
            <i class="pi pi-exclamation-circle"></i> {{ authStore.error }}
          </div>

          <Button type="submit" :label="isRegister ? t('login.registerButton') : t('login.submit')" :loading="authStore.loading" class="p-button-primary w-full mt-3" />

          <div class="auth-links">
            <span class="text-color-secondary">{{ isRegister ? t('login.hasAccount') : t('login.noWorkshop') }}</span><br>
            <a href="#" @click.prevent="isRegister = !isRegister" class="font-bold text-primary">
              {{ isRegister ? t('login.loginHere') : t('login.registerHere') }}
            </a>
            <hr>
            <router-link to="/tracking"
                         class="tracking">{{ isRegister ? t('auth.question') : t('auth.question') }}</router-link>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-layout { display: flex; min-height: 100vh; width: 100%; overflow: hidden; font-family: Inter, system-ui, sans-serif; background: #1f1f23; }
.hero-section { flex: 1; position: relative; background-image: linear-gradient( rgba(255,255,255,0.15), rgba(255,255,255,0.15) ), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; padding: 4rem; }
.hero-content { position: relative; z-index: 1; max-width: 480px; color: white; }
.hero-content h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -1px; }
.hero-content p { font-size: 1rem; line-height: 1.8; color: rgba(255,255,255,0.9); }
.form-section { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #f3f4f6; }
.login-box { width: 100%; max-width: 430px; padding: 3rem; background: #ffffff; border-radius: 14px; border-left: 3px solid #0b1680; box-shadow: 0 10px 35px rgba(0,0,0,0.08); color: #111827; }
.lang-switcher-wrapper { display: flex; justify-content: flex-end; margin-bottom: 1.5rem; }
.login-header { text-align: center; margin-bottom: 2rem; }
.login-header h2 { font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 0.7rem; }
.login-header p { color: #6b7280; font-size: 0.95rem; line-height: 1.5; }
.login-form { display: flex; flex-direction: column; gap: 1.3rem; }
.input-group { display: flex; flex-direction: column; gap: 0.55rem; }
.input-group label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7280; }
:deep(.p-inputtext), :deep(.p-password-input) { width: 100%; padding: 0.9rem 1rem; border-radius: 6px; border: 1px solid #d1d5db; background: #f9fafb; color: #111827; transition: all 0.2s ease; }
:deep(.p-inputtext::placeholder), :deep(.p-password-input::placeholder) { color: #9ca3af; }
:deep(.p-inputtext:focus), :deep(.p-password-input:focus) { border-color: #2563eb; background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
:deep(.p-password-panel) { display: none; }
:deep(.p-button) { width: 100%; margin-top: 0.5rem; border-radius: 6px !important; border: none !important; padding: 0.95rem !important; font-weight: 700; background: #0b1680 !important; transition: all 0.25s ease; box-shadow: 0 8px 18px rgba(37,99,235,0.25); }
:deep(.p-button:hover) { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(37,99,235,0.3); }
.error-message { display: flex; align-items: center; gap: 0.5rem; padding: 0.9rem; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 0.9rem; }
@media (max-width: 900px) { .login-layout { flex-direction: column; } .hero-section { display: flex; min-height: 240px; width: 100%; } .hero-section::after { display: none; } .hero-content { text-align: center; } .hero-content h1 { font-size: 2.4rem; } .hero-content p { font-size: 0.95rem; } .form-section { width: 100%; padding: 1.5rem; } .login-box { max-width: 100%; padding: 2rem; margin-top: -40px; position: relative; z-index: 2; } }
.auth-links {display: flex;flex-direction: column;align-items: center;justify-content: center;text-align: center;margin-top: 1.5rem;}

.auth-links hr {
  width: 100%;
  margin: 1rem 0;
}

.tracking {
  font-weight: 600;
  color: #0b1680;
  text-decoration: none;
}

.tracking:hover {
  text-decoration: underline;
}
</style>