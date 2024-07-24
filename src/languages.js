import universalLanguageDetect from '@unly/universal-language-detector';
import i18next from './i18n';
class InvalidLanguageError extends Error {
    constructor() {
        super(`${i18next.language} is not a valid language parameter.`);
        this.name = 'InvalidLanguageError';
    }
}
export function initLang(supported_langs, fallback_lang) {
    let lang = universalLanguageDetect({
        supportedLanguages: supported_langs, // Whitelist of supported languages, will be used to filter out languages that aren't supported
        fallbackLanguage: fallback_lang, // Fallback language in case the user's language cannot be resolved
    });
    const urlParams = new URLSearchParams(window.location.search);
    const lang_url = urlParams.get('lang');
    console.log(lang_url);
    if (lang_url) {
        lang = lang_url;
    }
    console.log(lang);
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
 * @returns {quiz_questions} - An array of quiz questions.
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
