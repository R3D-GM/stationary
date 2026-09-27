import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './locales/am.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { am: { translation: am }, en: { translation: en } },
  lng: localStorage.getItem('lang') || 'am',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language;

export default i18n;
