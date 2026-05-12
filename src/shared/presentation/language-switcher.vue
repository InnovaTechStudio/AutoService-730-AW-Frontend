<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';

const { locale, t } = useI18n();

const options = [
  { label: 'ES', value: 'es', flag: '🇵🇪' },
  { label: 'EN', value: 'en', flag: '🇺🇸' }
];

const currentOption = computed(() => options.find(o => o.value === locale.value) || options[0]);

function switchLocale(val) {
  locale.value = val;
  localStorage.setItem('autoservice-locale', val);
}
</script>

<template>
  <div class="lang-switcher">
    <button
        v-for="opt in options"
        :key="opt.value"
        :class="['lang-btn', { active: locale === opt.value }]"
        @click="switchLocale(opt.value)"
        :title="opt.label"
    >
      <span class="flag">{{ opt.flag }}</span>
      <span class="label">{{ opt.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  transition: all 0.18s ease;
  letter-spacing: 0.5px;
}

.lang-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.lang-btn.active {
  background: #ffffff;
  color: #0b1680;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.flag {
  font-size: 1rem;
  line-height: 1;
}

.label {
  font-size: 0.72rem;
}
</style>