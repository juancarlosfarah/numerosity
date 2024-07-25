import universalLanguageDetect from '@unly/universal-language-detector';

import i18next from './i18n';

// Type aliases for better code readability
type quiz_questions = {
  prompt: string;
  options: string[];
  required: boolean;
}[];

class InvalidLanguageError extends Error {
  constructor() {
    super(`${i18next.language} is not a valid language parameter.`);
    this.name = 'InvalidLanguageError';
  }
}

export function initLang(
  supported_langs: string[],
  fallback_lang: string,
): string {
  let lang: string = universalLanguageDetect({
    supportedLanguages: supported_langs, // Whitelist of supported languages, will be used to filter out languages that aren't supported
    fallbackLanguage: fallback_lang, // Fallback language in case the user's language cannot be resolved
  });

  const urlParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );
  const lang_url: string | null = urlParams.get('lang');

  if (lang_url) {
    lang = lang_url;
  }

  return lang;
}

/**
 * @function translateCountable
 * @description Translates 'people' or 'objects'.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects).
 * @returns {string} - The translated countable text.
 * @throws Will throw an error if the language parameter is not valid.
 */
export function translateCountable(cntable: 'people' | 'objects'): string {
  try {
    if (cntable === 'people') {
      return i18next.t('countablePeople');
    } else if (cntable === 'objects') {
      return i18next.t('countableObjects');
    } else {
      throw new InvalidLanguageError();
    }
  } catch (error) {
    console.error((error as InvalidLanguageError).message);
    return '';
  }
}

/**
 * @function quizQuestions
 * @description Generates quiz questions based on the type of countable.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects).
 * @returns {quiz_questions} - An array of quiz questions.
 * @throws Will throw an error if the language parameter is not valid.
 */
export function quizQuestions(cntable: 'people' | 'objects'): quiz_questions {
  return [
    {
      prompt: i18next.t('quizQuestionPrompt'),
      options: i18next.t('quizQuestionOptions', {
        returnObjects: true,
        cntable: translateCountable(cntable),
      }),
      required: true,
    },
  ];
}
