// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import ca from '../locales/ca/ca.json';
import de from '../locales/de/de.json';
import en from '../locales/en/en.json';
import es from '../locales/es/es.json';
import fr from '../locales/fr/fr.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      en: typeof en;
      fr: typeof fr;
      es: typeof es;
      ca: typeof ca;
      de: typeof de;
    };
  }
}
