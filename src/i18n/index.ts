import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '@/i18n/locales/en.json';
import viTranslation from '@/i18n/locales/vi.json';

// Retrieve saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('swiftchat_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      vi: { translation: viTranslation }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
