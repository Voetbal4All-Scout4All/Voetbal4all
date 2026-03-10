import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import nl from './locales/nl.json';
import fr from './locales/fr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';

export const SUPPORTED_LANGUAGES = ['nl', 'fr', 'en', 'de', 'es', 'it'];
export const DEFAULT_LANGUAGE = 'nl';

export const LANGUAGE_META = {
    nl: { label: 'Nederlands', flag: '🇳🇱', code: 'nl' },
    fr: { label: 'Français',   flag: '🇫🇷', code: 'fr' },
    en: { label: 'English',    flag: '🇬🇧', code: 'en' },
    de: { label: 'Deutsch',    flag: '🇩🇪', code: 'de' },
    es: { label: 'Español',    flag: '🇪🇸', code: 'es' },
    it: { label: 'Italiano',   flag: '🇮🇹', code: 'it' },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
        resources: {
                nl: { translation: nl },
                fr: { translation: fr },
                en: { translation: en },
                de: { translation: de },
                es: { translation: es },
                it: { translation: it },
        },
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        detection: {
                order: ['localStorage', 'navigator'],
                lookupLocalStorage: 's4a_language',
                cacheUserLanguage: true,
        },
        interpolation: { escapeValue: false },
  });

export default i18n;
