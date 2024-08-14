import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import jsPsychinstructions from '@jspsych/plugin-instructions';
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import i18next from 'i18next';
//import { DataCollection } from 'jspsych/src/modules/data/DataCollection';
// Import styles and language functions
import * as langf from './languages.js';
import { activateMQCunderline } from './utils.js';
/**
 * @function generateInputExample
 * @description Generates an HTML string for an example input screen used in the instructions.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @param {number} scale - The scale factor for the example screen.
 * @returns {string} - An HTML string representing the example input screen.
 */
const generateInputExample = (cntable, scale) => `
    <div class="inst-monitor" style="background-image: url('./assets/instruction-media/monitor-crosshair.png');">
      <div class="inst-screen input-example" style="background-color: black; transform: scale(${scale}) translateY(-25%);">
        <p style="cursor: default;">${i18next.t('instructionScreenExample', { cntable: langf.translateCountable(cntable) })}</p>
        <input type="number" style="cursor: default;" readonly>
        <br><br>
        <button class="jspsych-btn" style="pointer-events: none;" readonly>${i18next.t('estimateSubmitBtn')}</button>
      </div>
    </div>`;
/**
 * @function generateInstructionPages
 * @description Generate instruction pages based on the type of countable (people/objects).
 * If example is true, it generates the example page with a video.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { string[] } - Array of instruction pages as HTML strings
 */
function generateInstructionPages(cntable) {
    const instruction_imgs = [
        `
    <div class="inst-monitor" style="background-image: url('./assets/instruction-media/monitor-crosshair.png');">
    </div>`,
        `
    <div class="inst-monitor" style="background-image: url('./assets/instruction-media/monitor-crosshair.png');">
      <div class="inst-screen">
        <img src="./assets/instruction-media/screen-${cntable}.png" alt='task image'>
      </div>
    </div>`,
        generateInputExample(cntable, 0.36),
    ];
    const pages = [];
    for (let page_nb = 0; page_nb < 3; page_nb++) {
        pages.push(`<b>${i18next.t('instructionTitle')}</b><br>
      <div class="inst-container">
        ${instruction_imgs[page_nb]}
        <p class="inst-text"><b>${i18next.t('instructionTexts', { returnObjects: true, cntable: langf.translateCountable(cntable) })[page_nb]}</b></p>
      </div>`);
    }
    pages.push(`<b>${i18next.t('instructionTitle')}</b><br>
    <div class="inst-container">
      <div class="inst-monitor" id="monitor-group">
        ${instruction_imgs[0]}
        ${instruction_imgs[1]}
        ${generateInputExample(cntable, 0.24)}
      </div>
      <p class="inst-text"><b>${i18next.t('instructionTexts', { returnObjects: true })[3]}</b></p>
    </div>`);
    pages.push(`<b>${i18next.t('instructionTitle')}</b><br>
    <div class="inst-container">
      ${instruction_imgs[2]}
      <p class="inst-text"><b>${i18next.t('instructionTexts', { returnObjects: true, cntable: langf.translateCountable(cntable) })[4]}</b></p>
    </div>`);
    pages.push(`<b>${i18next.t('instructionTitle')}</b><div class="inst-container" style="flex-direction: column; transform: scale(0.75);"><p>${i18next.t('instructionExample', { cntable: langf.translateCountable(cntable) })}</p><video muted autoplay loop preload="auto" src="./assets/instruction-media/${cntable}-vid.mp4"><source type="video/mp4"></source></video></div><br>`);
    return pages;
}
/**
 * @function instructions
 * @description Create instruction timeline based on the type of countable.
 * Combines both text and example (video) instructions.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { timeline } - Timeline for instructions
 */
function instructions(cntable) {
    return {
        timeline: [
            {
                type: jsPsychinstructions,
                pages: generateInstructionPages(cntable),
                button_label_next: i18next.t('instructionBtnNext'),
                button_label_previous: i18next.t('instructionBtnPrevious'),
                show_clickable_nav: true,
            },
        ],
    };
}
/**
 * @function instructionQuiz
 * @description Instruction quiz timeline with looping functionality until correct answers are given.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { timeline } - Timeline for instruction quiz
 */
const instructionQuiz = (jsPsych, cntable) => ({
    timeline: [
        {
            type: jsPsychSurveyMultiChoice,
            questions: langf.quizQuestions(cntable),
            preamble: `<b>${i18next.t('quizPreamble')}</b><br><br><button id="quiz-repeat-btn" class="jspsych-btn" style="cursor: pointer;">${i18next.t('repeatInstructions')}</button>`,
            button_label: i18next.t('estimateSubmitBtn'),
        },
    ],
    on_load: () => {
        //make repeat instruction button fulfill its function
        document
            .getElementById('quiz-repeat-btn')
            .addEventListener('click', () => {
            jsPsych.finishTrial({
                response: { Q0: 'read-again' },
            });
        });
        //make selected choice underlined
        activateMQCunderline();
    },
});
/**
 * @function returnPage
 * @description Generates a timeline object for displaying a return page based on the specified countable type.
 * The return page is conditional based on the user's previous response.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @returns {timeline} - An object representing the timeline for the return page.
 */
const returnPage = (jsPsych, cntable) => ({
    timeline: [
        {
            type: HtmlButtonResponsePlugin,
            stimulus: `<p><b>${i18next.t('repeatInstructions')}</b></p>`,
            choices: [i18next.t('repeatInstructions')],
        },
    ],
    conditional_function: function () {
        return (jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
            'read-again' &&
            jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
                langf.quizQuestions(cntable)[0].options[2]);
    },
});
/**
 * @function groupInstructions
 * @description Generates a timeline object for displaying group instructions including the instruction text,
 * instruction quiz, and return page based on the countable type and experiment phase.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @param {boolean} [second_half=false] - Indicates if it is the second half of the experiment.
 * @returns {timeline} - An object representing the timeline for the group instructions.
 */
export const groupInstructions = (jsPsych, cntable, second_half = false) => ({
    timeline: [
        instructions(cntable),
        instructionQuiz(jsPsych, cntable, second_half),
        returnPage(jsPsych, cntable),
    ],
    loop_function: function (data) {
        return (data.last(2).values()[1].response.Q0 !==
            langf.quizQuestions(cntable)[0].options[2]);
    },
    on_finish: () => {
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
/**
 * @function tipScreen
 * @description Generates a timeline object for displaying a tip screen.
 * @returns {timeline} - An object representing the timeline for the tip screen.
 */
export function tipScreen() {
    return {
        timeline: [
            {
                type: HtmlButtonResponsePlugin,
                stimulus: `<b>${i18next.t('tipTitle')}</b><br><img src="./assets/instruction-media/tip.png" alt='tip image' style="width: auto;"><br>${i18next.t('tipDescription')}<br><br>`,
                choices: [i18next.t('tipBtnTxt')],
            },
        ],
    };
}
