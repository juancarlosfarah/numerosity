/**
 * @title Numerosity
 * @description Social numerosity task.
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
// Import required plugins and modules from jsPsych
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychinstructions from '@jspsych/plugin-instructions';
import PreloadPlugin from '@jspsych/plugin-preload';
import JsResize from '@jspsych/plugin-resize';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import i18next from 'i18next';
import { initJsPsych } from 'jspsych';
//import { DataCollection } from 'jspsych/src/modules/data/DataCollection';
// Import styles and language functions
import '../styles/main.scss';
import * as langf from './languages.js';
function generatePreloadStrings() {
    const cntables = ['people', 'objects'];
    const path_list = [];
    for (let i = 0; i < 2; i++) {
        for (let num = 5; num < 9; num++) {
            for (let id = 0; id < 10; id++) {
                path_list.push(`../assets/num-task-imgs/${cntables[i]}/num-${num}-${id}.png`);
            }
        }
    }
    return path_list;
}
/**
 * @function resize
 * @description Generates the resize timeline for the experiment with calibration and quit button.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @returns {timeline} - The timeline object for resizing.
 */
const resize = (jsPsych) => ({
    timeline: [
        {
            type: JsResize,
            item_width: 8.56,
            item_height: 5.398,
            prompt: `<p>${i18next.t('calibration')}</p>`,
            starting_size: 323.52755906,
            button_label: i18next.t('resizeBtn'),
        },
    ],
    on_load: function () {
        const quit_btn = document.createElement('button');
        quit_btn.setAttribute('type', 'button');
        quit_btn.setAttribute('style', 'color: #fff; border-radius: 4px; background-color: #1d2124; border-color: #171a1d; position: absolute; right: 1%; top: 50%; transform: translateY(-50%)');
        quit_btn.addEventListener('click', () => quitBtnAction(jsPsych));
        quit_btn.appendChild(document.createTextNode(i18next.t('quitBtn')));
        document
            .getElementById('jspsych-progressbar-container')
            .appendChild(quit_btn);
    },
    on_finish: function () {
        const style = document.createElement('style');
        style.innerHTML = `img, vid {
      width: ${jsPsych.data.get().last(1).values()[0].scale_factor * 1680}px;
      height: auto}`;
        document.head.appendChild(style);
    },
});
/**
 * @function generateInstructionPages
 * @description Generate instruction pages based on the type of countable (people/objects).
 * If example is true, it generates the example page with a video.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { string[] } - Array of instruction pages as HTML strings
 */
function generateInstructionPages(cntable) {
    const pages = [];
    for (let page_nb = 1; page_nb < 6; page_nb++) {
        pages.push(`<b>${i18next.t('instructionTitle')}</b><br><img src='../assets/instruction-media/${cntable}/${i18next.language}/instruction-${page_nb}.png'></img>`);
    }
    pages.push(`<b>${i18next.t('instructionTitle')}</b><br>${i18next.t('instructionExample', { cntable: langf.translateCountable(cntable) })}<br><video muted autoplay loop preload="auto" src="../assets/instruction-media/${cntable}/example-vid.mp4"><source type="video/mp4"></source></video>`);
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
 * @param { boolean } second_half - Whether it is the second half of the quiz
 * @returns { timeline } - Timeline for instruction quiz
 */
const instructionQuiz = (jsPsych, cntable, second_half = false) => ({
    timeline: [
        {
            type: jsPsychSurveyMultiChoice,
            questions: langf.quizQuestions(cntable),
            preamble: `<b>${i18next.t('quizPreamblesHalf', { returnObjects: true })[Number(second_half)]}</b><br><br><button id="quiz-repeat-btn" class="jspsych-btn" style="cursor: pointer;">${i18next.t('repeatInstructions')}</button>`,
        },
    ],
    on_load: () => {
        document
            .getElementById('quiz-repeat-btn')
            .addEventListener('click', () => {
            jsPsych.finishTrial({
                response: { Q0: 'read-again' },
            });
        });
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
const groupInstructions = (jsPsych, cntable, second_half = false) => ({
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
function tipScreen() {
    return {
        timeline: [
            {
                type: HtmlButtonResponsePlugin,
                stimulus: `<b>${i18next.t('tipTitle')}</b><br><img src="../assets/instruction-media/tip.png"><br>`,
                prompt: i18next.t('tipDescription'),
                choices: [i18next.t('tipBtnTxt')],
            },
        ],
    };
}
/**
 * @function generateTimelineVars
 * @description Generate timeline variables for the experiment.
 * For each numerosity, "nb_block" images are randomly selected and put in a list ordered by numerosity.
 * @param { JsPsych } JsPsych - The jsPsych instance
 * @param { number } nb_blocks - Number of blocks per numerosity
 * @returns { img_description[] } - Array of image descriptions
 */
function generateTimelineVars(JsPsych, nb_blocks) {
    const timeline_variables = [];
    for (let num = 5; num <= 8; num++) {
        const id_list = JsPsych.randomization.sampleWithoutReplacement([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nb_blocks);
        for (let i = 0; i < nb_blocks; i++) {
            timeline_variables.push({ num: num, id: id_list[i] });
        }
    }
    return timeline_variables;
}
/**
 * @function partofexp
 * @description Timeline for one half of the numerosity task.
 * The order of stimuli correspond to the following pattern:
 * There are "nb_blocks" blocks consisting of a random image from each numerosity (5,6,7,8) in random order.
 * Two identical images will never be contained in one experiment.
 * @param { JsPsych } jsPsych - The jsPsych instance
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @param { number } nb_blocks - Number of blocks per half
 * @param { { completed: number } } progress - Object tracking the progress
 * @returns { timeline } - Timeline for one half of the numerosity task
 */
const partofexp = (jsPsych, cntable, nb_blocks, progress) => ({
    timeline: [
        // Crosshair shown before each image for 500ms.
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '+',
            choices: 'NO_KEYS',
            trial_duration: 500,
            on_start: () => {
                document.body.style.cursor = 'none';
            },
        },
        // Image is shown for 250ms
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                return `<img src='../assets/num-task-imgs/${cntable}/num-${jsPsych.evaluateTimelineVariable('num')}-${jsPsych.evaluateTimelineVariable('id')}.png'>`;
            },
            choices: 'NO_KEYS',
            trial_duration: 250,
            on_finish: () => {
                document.body.style.cursor = 'auto';
            },
        },
        // Survey to ask how many countables (people/objects) were estimated.
        {
            type: jsPsychSurveyHtmlForm,
            preamble: `How many ${cntable} were in the virtual room?`,
            html: '<input type="number" name="num-input" id="task-input" required min="0" step="1"><br>',
            autofocus: 'task-input',
            on_load: () => {
                const input = document.getElementById('task-input');
                // Initially set the custom validity message
                input.setCustomValidity(i18next.t('inputInfo'));
                // Add input event listener
                input.addEventListener('input', () => {
                    // If the input value is not empty, clear the custom validity message
                    input.setCustomValidity(input.value === '' ? i18next.t('inputInfo') : '');
                });
            },
            on_finish: function () {
                progress.completed++;
                jsPsych.progressBar.progress = progress.completed / (8 * nb_blocks);
            },
        },
    ],
    // Generate random timeline variables (pick random images for each numerosity).
    timeline_variables: generateTimelineVars(jsPsych, nb_blocks),
    sample: {
        type: 'custom',
        // Custom sampling function to produce semi-random pattern described in function description.
        fn: function (t) {
            const blocks = t.length / 4;
            let template = [];
            let intermediate = [];
            let new_t = [];
            // Shuffle all indices for timeline variables with same numerosity
            for (let nums = 0; nums < 4; nums++) {
                template = [...Array(blocks).keys()].map((x) => x + nums * blocks);
                intermediate = intermediate.concat(jsPsych.randomization.shuffle(template));
            }
            // Create and append block of four numerosities by picking one of each (shuffled) numerosity groups in template array.
            for (let i = 0; i < blocks; i++) {
                const block = [];
                block.push(intermediate[i], intermediate[i + blocks], intermediate[i + 2 * blocks], intermediate[i + 3 * blocks]);
                // Shuffle order of numerosity in a block and append.
                new_t = new_t.concat(jsPsych.randomization.shuffle(block));
            }
            return new_t;
        },
    },
});
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
        .map((option, index) => `<div><input type="radio" name="quit-option" value="${index}" id="option-${index}" required><label for="option-${index}">${option}</label></div>`)
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
function quitBtnAction(jsPsych) {
    const panel = document.createElement('div');
    panel.setAttribute('id', 'quit-overlay');
    panel.classList.add('custom-overlay');
    panel.innerHTML = generateQuitSurvey();
    document.body.appendChild(panel);
    const form = document.getElementById('quit-form');
    const options = form.querySelectorAll('input[name="quit-option"]');
    options.forEach((option) => {
        option.addEventListener('invalid', () => {
            option.setCustomValidity(i18next.t('quitSurveyInputInfo'));
        });
    });
    document.getElementById('quit-close-btn').addEventListener('click', () => {
        document.body.removeChild(panel);
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
function showEndScreen(message) {
    const screen = document.createElement('div');
    screen.classList.add('custom-overlay');
    screen.innerHTML = `<h2 style="text-align: center; top: 50%;">${message}</h2>`;
    document.body.appendChild(screen);
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 * Initializes jsPsych, sets up the timeline, and runs the experiment.
 * @returns { Promise<JsPsych> } - Promise resolving to the jsPsych instance
 */
export async function run( /*{
  assetPaths,
  input = {},
  environment,
  title,
  version,
}*/) {
    const blocks_per_half = 5;
    const progress = { completed: 0 };
    const jsPsych = initJsPsych({
        show_progress_bar: true,
        auto_update_progress_bar: false,
        message_progress_bar: i18next.t('progressBar'),
        on_finish: () => {
            jsPsych.data.get().localSave('json', 'experiment-data.json');
        },
    });
    const timeline = [];
    jsPsych;
    // Preload assets
    timeline.push({
        type: PreloadPlugin,
        images: generatePreloadStrings(),
    });
    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: '',
        button_label: i18next.t('fullscreen'),
    });
    timeline.push(resize(jsPsych));
    // Run numerosity task
    timeline.push(groupInstructions(jsPsych, 'people'), tipScreen(), partofexp(jsPsych, 'people', blocks_per_half, progress), groupInstructions(jsPsych, 'objects', true), tipScreen(), partofexp(jsPsych, 'objects', blocks_per_half, progress));
    await jsPsych.run(timeline);
    if (jsPsych.data.get().last(2).values()[0].trial_type === 'quit-survey') {
        showEndScreen(i18next.t('abortedMessage'));
    }
    else {
        showEndScreen(i18next.t('endMessage'));
    }
    // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
    // if you handle results yourself, be it here or in `on_finish()`)
    return jsPsych;
}
