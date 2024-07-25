import i18next from 'i18next';
import { initLang } from './languages.js';
// Import your translation files
import ca from './locales/ca/ca.json';
import en from './locales/en/en.json';
import es from './locales/es/es.json';
import fr from './locales/fr/fr.json';
const fallback_lang = 'en';
const lang = initLang(['en', 'fr', 'es', 'ca'], fallback_lang);
// Initialize i18next
i18next.init({
    lng: lang, // default language
    fallbackLng: fallback_lang,
    resources: {
        en: { translation: en },
        fr: { translation: fr },
        es: { translation: es },
        ca: { translation: ca },
    },
    interpolation: {
        escapeValue: false, // not needed for Node.js
    },
}, (err) => {
    if (err)
        console.error('i18next initialization error:', err);
});
export default i18next;
