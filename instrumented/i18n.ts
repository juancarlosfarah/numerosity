import i18next from 'i18next';

// Import your translation files
import ca from '../src/locales/ca/ca.json';
import de from '../src/locales/de/de.json';
import en from '../src/locales/en/en.json';
import es from '../src/locales/es/es.json';
import fr from '../src/locales/fr/fr.json';
import { initLang } from './languages.js';

const fallback_lang: string = 'en';

const lang: string = initLang(['en', 'fr', 'es', 'ca', 'de'], fallback_lang);

// Initialize i18next
i18next.init(
  {
    lng: lang, // default language
    fallbackLng: fallback_lang,
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      ca: { translation: ca },
      de: { translation: de },
    },
    interpolation: {
      escapeValue: false, // not needed for Node.js
    },
  },
  (err) => {
    if (err) console.error('i18next initialization error:', err);
  },
);

export default i18next;
