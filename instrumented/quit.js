// You can import stylesheets (.scss or .css).
// Import required plugins and modules from jsPsych
import i18next from 'i18next';
import { activateMQCunderline } from './utils';
/**
 * @function generateQuitSurvey
 * @description Generates the HTML for the quit survey with options and a form.
 * @param {quit_survey_text} texts - The text object containing survey details.
 * @returns {string} - The HTML string for the quit survey.
 */
function generateQuitSurvey() {
    return `
    <div class="quit-survey-content">
      <div style="position: relative;">
        <h2 style="vertical-align: middle;"><b>${i18next.t('quitSurveyPreamble')}</b></h2>
        <button id="quit-close-btn" class="jspsych-btn">${i18next.t('quitSurveyBtnClose')}</button>
      </div>
      <br>
      <form id="quit-form">
        <div>
          <label><b>${i18next.t('quitSurveyPrompt')}</b></label>
        </div>
        ${i18next.t('quitSurveyOptions', { returnObjects: true })
        .map((option, index) => `<div class="jspsych-survey-multi-choice-text"><input type="radio" name="quit-option" value="${index}" id="option-${index}" required><label for="option-${index}">${option}</label></div>`)
        .join('')}
        <div align="center">
          <input type="submit" class="jspsych-btn" id="quit-end-btn" value="${i18next.t('quitSurveyBtnEnd')}">
        </div>
      </form>
    </div>`;
}
/**
 * @function quitBtnAction
 * @description Creates and displays the quit survey form when the quit button is clicked.
 * This includes handling form submission, validation, and the close button action.
 * @param { JsPsych } jsPsych - The JsPsych instance.
 */
export function quitBtnAction(jsPsych) {
    jsPsych.pauseExperiment();
    const panel = document.createElement('div');
    panel.setAttribute('id', 'quit-overlay');
    panel.classList.add('custom-overlay');
    panel.innerHTML = generateQuitSurvey();
    document.body.appendChild(panel);
    document.body.style.cursor = 'auto';
    const form = document.getElementById('quit-form');
    const options = form.querySelectorAll('input[name="quit-option"]');
    options.forEach((option) => {
        option.addEventListener('invalid', () => {
            option.setCustomValidity(i18next.t('quitSurveyInputInfo'));
        });
    });
    activateMQCunderline();
    document.getElementById('quit-close-btn').addEventListener('click', () => {
        document.body.removeChild(panel);
        jsPsych.resumeExperiment();
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
    });
    document.getElementById('quit-end-btn').addEventListener('click', () => {
        const selected_option = document.querySelector('input[name="quit-option"]:checked');
        if (selected_option) {
            options.forEach((option) => {
                option.setCustomValidity('');
            });
            // Save the selected value to jsPsych data
            jsPsych.data.get().push({
                trial_type: 'quit-survey',
                quit_reason: selected_option.value,
            });
            document.body.removeChild(panel);
            // End the experiment
            jsPsych.abortExperiment();
        }
    });
}
/**
 * @function showEndScreen
 * @description Creates and displays an end screen overlay with a given message. If the document is in fullscreen mode, it exits fullscreen.
 * @param {string} message - The message to be displayed on the end screen.
 */
export function showEndScreen(message) {
    const screen = document.createElement('div');
    screen.classList.add('custom-overlay');
    screen.innerHTML = `<h2 style="text-align: center; top: 50%;">${message}</h2>`;
    document.body.appendChild(screen);
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}
