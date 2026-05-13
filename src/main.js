/**
 * @file main.js
 * @description **Bootstrap File** - Entry point of the entire Vue.js application.
 * This file is responsible for creating the Vue app instance and registering all
 * global plugins and services before mounting the root component.
 *
 * Architecture: This follows the standard Vue 3 + Vite setup.
 */
import { createApp } from 'vue';
/** Pinia: Global State Management */
import { createPinia } from 'pinia';
/** PrimeVue: UI Library with Aura Theme */
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
/** Vue Router: Navigation */
import router from './router';
import i18n from './i18n.js';
import 'primeicons/primeicons.css';
import './style.css';
import Dialog from "primevue/dialog";
import Button from "primevue/button";


const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {theme: {preset: Aura, options: {
            darkModeSelector: '.my-app-dark',
        }
    }
});
/** Vue I18n: Multi-language Support */
app.use(i18n);
app.component('Dialog', Dialog);
app.component('Button', Button);

app.mount('#app');