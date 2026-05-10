<template>
  <div class="lang-switcher">
    <button
        v-for="lang in languages"
        :key="lang.code"
        :class="['lang-btn', { active: currentLocale === lang.code }]"
        @click="changeLanguage(lang.code)"
        :title="lang.label"
    >
      <span class="flag">{{ lang.flag }}</span>
      <span class="code">{{ lang.code.toUpperCase() }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

const languages = [
  { code: 'es', flag: '🇵🇪', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' }
];

function changeLanguage(code) {
  locale.value = code;
  localStorage.setItem('locale', code);
}
</script>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
}
.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.15s ease;
}
.lang-btn:hover { background: #e2e8f0; color: #1e293b; }
.lang-btn.active { background: white; color: #1e3a8a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.flag { font-size: 1rem; line-height: 1; }
.code { letter-spacing: 0.5px; }
</style>
