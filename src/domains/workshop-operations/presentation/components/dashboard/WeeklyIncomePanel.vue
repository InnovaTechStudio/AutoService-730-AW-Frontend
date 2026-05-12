<template>
  <Card class="panel-card income-card">
    <template #content>
      <div class="panel-heading">
        <div>
          <h2>{{ t('dashboard.panels.weeklyIncome.title') }}</h2>
          <p>{{ t('dashboard.panels.weeklyIncome.subtitle') }}</p>
        </div>
        <strong>S/. {{ weeklyIncome }}</strong>
      </div>

      <Chart type="bar" :data="chartData" :options="chartOptions" class="income-chart" />

      <div class="comparison-box">
        <i class="pi pi-arrow-up-right"></i>
        <div>
          <strong>{{ t('dashboard.panels.weeklyIncome.comparison') }}</strong>
          <span>{{ t('dashboard.panels.weeklyIncome.comparisonDetail') }}</span>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  weeklyIncome: { type: [Number, String], default: 0 },
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, required: true }
});
</script>

<style scoped>
.panel-card { border-radius: 24px; border: 1px solid #e8edf5; box-shadow: 0 14px 34px rgba(15,23,42,0.06); }
.income-card { background: linear-gradient(180deg,#ffffff 0%,#f8fbff 100%); }
.panel-heading { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
h2 { margin: 0; color: #0f172a; font-size: 1.28rem; }
p { margin: 0.25rem 0 0; color: #64748b; }
.panel-heading > strong { color: #0b1680; font-size: 1.4rem; }
.income-chart { height: 250px; }
.comparison-box { display: flex; gap: 0.8rem; align-items: center; margin-top: 1rem; padding: 1rem; border-radius: 18px; background: #f0fdf4; color: #166534; }
.comparison-box i { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 14px; background: #dcfce7; }
.comparison-box strong, .comparison-box span { display: block; }
.comparison-box span { margin-top: 0.15rem; color: #4b5563; font-size: 0.9rem; }
</style>