import universalLanguageDetect from '@unly/universal-language-detector';
import i18next from './i18n';
class InvalidLanguageError extends Error {
    constructor() {
        super(`${i18next.language} is not a valid language parameter.`);
        this.name = 'InvalidLanguageError';
    }
}
/**
 * @function initLang
 * @description Initializes and returns the language to be used in the application. It first attempts to detect the user's language, then checks for a language parameter in the URL, and finally falls back to a default language if necessary.
 * @param {string[]} supportedLanguages - An array of supported language codes.
 * @param {string} fallbackLanguage - The default language code to use if no valid language is detected.
 * @returns {string} - The determined language code to be used in the application.
 */
export function initLang(supportedLanguages, fallbackLanguage) {
    let lang = universalLanguageDetect({
        supportedLanguages: supportedLanguages, // Whitelist of supported languages, will be used to filter out languages that aren't supported
        fallbackLanguage: fallbackLanguage, // Fallback language in case the user's language cannot be resolved
    });
    const urlParams = new URLSearchParams(window.location.search);
    const languageUrl = urlParams.get('lang');
    if (languageUrl) {
        lang = languageUrl;
    }
    if (!supportedLanguages.includes(lang)) {
        lang = fallbackLanguage;
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
export function translateCountable(cntable) {
    try {
        if (cntable === 'people') {
            return i18next.t('countablePeople');
        }
        else if (cntable === 'objects') {
            return i18next.t('countableObjects');
        }
        else {
            throw new InvalidLanguageError();
        }
    }
    catch (error) {
        console.error(error.message);
        return '';
    }
}
/**
 * @function quizQuestions
 * @description Generates quiz questions based on the type of countable.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects).
 * @returns {quizQuestions} - An array of quiz questions.
 * @throws Will throw an error if the language parameter is not valid.
 */
export function quizQuestions(cntable) {
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
