/**
 * @file src/i18n.js
 * @description Configuración de vue-i18n. Soporta español (es) e inglés (en).
 * El idioma activo se persiste en localStorage bajo la clave 'locale'.
 * @module i18n
 */
import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';

/** @type {string[]} Idiomas soportados por la aplicación. */
const SUPPORTED_LOCALES = ['es', 'en'];

/**
 * Lee el idioma guardado en localStorage, o usa 'es' como fallback.
 * @returns {string}
 */
function getInitialLocale() {
    const saved = localStorage.getItem('locale');
    return SUPPORTED_LOCALES.includes(saved) ? saved : 'es';
}

/**
 * Instancia de vue-i18n con Composition API habilitada (legacy: false).
 * @type {import('vue-i18n').I18n}
 */
const i18n = createI18n({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'es',
    messages: { es, en }
});

/**
 * Cambia el idioma activo y lo guarda en localStorage.
 * @param {'es'|'en'} locale
 */
export function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    i18n.global.locale.value = locale;
    localStorage.setItem('locale', locale);
}

export default i18n;
