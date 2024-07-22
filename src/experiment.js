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
import { initJsPsych } from 'jspsych';
// Import styles and language functions
import '../styles/main.scss';
import * as langf from './languages.js';
const resize = (jsPsych, lang) => ({
    timeline: [
        {
            type: JsResize,
            item_width: 8.56,
            item_height: 5.398,
            prompt: `<p>${langf.translateCalibration(lang)}</p>`,
            starting_size: 323.52755906,
        },
    ],
    on_load: function () {
        const quit_btn = document.createElement('button');
        quit_btn.setAttribute('type', 'button');
        quit_btn.setAttribute('style', 'color: #fff; background-color: #1d2124; border-color: #171a1d;');
        quit_btn.addEventListener('click', () => quitBtnAction(jsPsych, lang));
        quit_btn.appendChild(document.createTextNode(langf.translateQuitBtn(lang)));
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
 * @description Generate instruction pages based on the type of countable (people/objects), language, and text.
 * If example is true, it generates the example page with a video.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @param { language } lang - The language in which instructions are shown
 * @param { instruction_text } text - The text for instructions
 * @returns { string[] } - Array of instruction pages as HTML strings
 */
function generateInstructionPages(cntable, lang, text) {
    const pages = [];
    for (let page_nb = 1; page_nb < 6; page_nb++) {
        pages.push(`<b>${text.title}</b><br><img src='../assets/instruction_media/${cntable}/${lang}/instruction_${page_nb}.png'></img>`);
    }
    pages.push(`<b>${text.title}</b><br>` +
        text.example +
        `<br><video muted autoplay loop preload="auto" src="../assets/instruction_media/${cntable}/example_vid.mp4"><source type="video/mp4"></source></video>`);
    return pages;
}
/**
 * @function instructions
 * @description Create instruction timeline based on the type of countable and language.
 * Combines both text and example (video) instructions.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @param { language } lang - The language in which instructions are shown
 * @returns { timeline } - Timeline for instructions
 */
function instructions(cntable, lang) {
    const text = langf.instructionTexts(cntable, lang);
    return {
        timeline: [
            {
                type: jsPsychinstructions,
                pages: generateInstructionPages(cntable, lang, text),
                button_label_next: text.btn_next,
                button_label_previous: text.btn_previous,
                show_clickable_nav: true,
            },
        ],
    };
}
/**
 * @function instructionQuiz
 * @description Instruction quiz timeline with looping functionality until correct answers are given.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @param { language } lang - The language in which quiz is presented
 * @param { boolean } second_half - Whether it is the second half of the quiz
 * @returns { timeline } - Timeline for instruction quiz
 */
const instructionQuiz = (jsPsych, cntable, lang, second_half = false) => ({
    timeline: [
        {
            type: jsPsychSurveyMultiChoice,
            questions: langf.quizQuestions(cntable, lang),
            preamble: `<b>${langf.translatePreamble(second_half, lang)}</b><br><button id="quiz_repeat_btn" style="cursor: pointer;">${langf.translateRepeat(lang)}</button>`,
        },
    ],
    on_load: () => {
        document
            .getElementById('quiz_repeat_btn')
            .addEventListener('click', () => {
            jsPsych.finishTrial({
                response: { Q0: 'read_again' },
            });
        });
    },
});
/**
 * @function returnPage
 * @description Generates a timeline object for displaying a return page based on the specified language and countable type.
 * The return page is conditional based on the user's previous response.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @param {language} lang - The language code for the return page text.
 * @returns {timeline} - An object representing the timeline for the return page.
 */
const returnPage = (jsPsych, cntable, lang) => ({
    timeline: [
        {
            type: HtmlButtonResponsePlugin,
            stimulus: `<p><b>${langf.translateRepeat(lang)}</b></p>`,
            choices: [langf.translateRepeat(lang)],
        },
    ],
    conditional_function: function () {
        return (jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
            'read_again' &&
            jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
                langf.quizQuestions(cntable, lang)[0].options[2]);
    },
});
/**
 * @function groupInstructions
 * @description Generates a timeline object for displaying group instructions including the instruction text,
 * instruction quiz, and return page based on the specified language, countable type, and experiment phase.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @param {language} lang - The language code for the instruction texts.
 * @param {boolean} [second_half=false] - Indicates if it is the second half of the experiment.
 * @returns {timeline} - An object representing the timeline for the group instructions.
 */
const groupInstructions = (jsPsych, cntable, lang, second_half = false) => ({
    timeline: [
        instructions(cntable, lang),
        instructionQuiz(jsPsych, cntable, lang, second_half),
        returnPage(jsPsych, cntable, lang),
    ],
    loop_function: function (data) {
        return (data.last(2).values()[1].response.Q0 !==
            langf.quizQuestions(cntable, lang)[0].options[2]);
    },
    on_finish: () => {
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
/**
 * @function tipScreen
 * @description Generates a timeline object for displaying a tip screen based on the specified language.
 * @param {language} lang - The language code for the tips text.
 * @returns {timeline} - An object representing the timeline for the tip screen.
 */
function tipScreen(lang) {
    const tiptext = langf.translateTip(lang);
    return {
        timeline: [
            {
                type: HtmlButtonResponsePlugin,
                stimulus: `<b>${tiptext.title}</b><br><img src="../assets/instruction_media/tip.png"><br>`,
                prompt: tiptext.description,
                choices: [tiptext.btn_txt],
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
 * @param { language } lang - The language in which task is presented
 * @param { number } nb_blocks - Number of blocks per half
 * @param { { completed: number } } progress - Object tracking the progress
 * @returns { timeline } - Timeline for one half of the numerosity task
 */
const partofexp = (jsPsych, cntable, lang, nb_blocks, progress) => ({
    timeline: [
        // Crosshair shown before each image for 500ms.
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '+',
            choices: 'NO_KEYS',
            trial_duration: 500,
        },
        // Image is shown for 250ms
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                return `<img src='../assets/num_task_imgs/${cntable}/num_${jsPsych.timelineVariable('num')}_${jsPsych.timelineVariable('id')}.png'>`;
            },
            choices: 'NO_KEYS',
            trial_duration: 250,
        },
        // Survey to ask how many countables (people/objects) were estimated.
        {
            type: jsPsychSurveyHtmlForm,
            preamble: 'How many ' + cntable + ' were in the virtual room?',
            html: '<input type="number" id="task_input" required min="0" step="1"><br>',
            autofocus: 'task_input',
            on_load: () => {
                const input = document.getElementById('task_input');
                // Initially set the custom validity message
                input.setCustomValidity(langf.inputInfo(lang));
                // Add input event listener
                input.addEventListener('input', () => {
                    // If the input value is not empty, clear the custom validity message
                    if (input.value === '') {
                        input.setCustomValidity(langf.inputInfo(lang));
                    }
                    else {
                        input.setCustomValidity('');
                    }
                });
            },
            on_finish: function () {
                progress.completed++;
                jsPsych.setProgressBar(progress.completed / (8 * nb_blocks));
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
 * @description Generates the HTML string for the quit survey form based on the provided texts.
 * This includes the preamble, prompt, options, input information, and buttons for quitting or closing the survey.
 * @param {
 *   preamble: string,
 *   prompt: string,
 *   options: string[],
 *   input_info: string,
 *   btn_close: string,
 *   btn_end: string
 * } texts - The text for the preamble, prompt, options, input information, and buttons.
 * @returns { string } - The HTML string for the quit survey form.
 */
function generateQuitSurvey(texts) {
    let html_input = `
    <div class="quit-survey-content">
        <label>
          <h2 align="left" style="color: white;"><b>${texts.preamble}</b></h2>
        </label>
        <button type="button" class="btn" id="quit_close_btn">${texts.btn_close}</button>
      <br>
      <form id="quit_form">
        <div>
          <label><b>${texts.prompt}</b></label>
        </div>`;
    texts.options.forEach((option, index) => {
        html_input += `
        <div>
          <input type="radio" name="quit_option" value="${index}" id="option_${index}" required>
          <label for="option_${index}">${option}</label>
        </div>`;
    });
    html_input += `
        <div align="center">
          <input type="submit" id="quit_end_btn" value="${texts.btn_end}">
        </div>
      </form>
    </div>`;
    return html_input;
}
/**
 * @function quitBtnAction
 * @description Creates and displays the quit survey form when the quit button is clicked.
 * This includes handling form submission, validation, and the close button action.
 * @param { JsPsych } jsPsych - The JsPsych instance.
 * @param { 'en' | 'fr' | 'es' | 'ca' } lang - The language in which the quit survey text should be displayed.
 */
function quitBtnAction(jsPsych, lang) {
    const panel = document.createElement('div');
    const quit_survey_text = langf.quitSurveyText(lang);
    panel.setAttribute('id', 'quit_overlay');
    panel.classList.add('quit-survey-panel');
    panel.innerHTML = generateQuitSurvey(quit_survey_text);
    document.body.appendChild(panel);
    const form = document.getElementById('quit_form');
    const options = form.querySelectorAll('input[name="quit_option"]');
    options.forEach((option) => {
        option.addEventListener('invalid', () => {
            option.setCustomValidity(langf.quitSurveyText(lang).input_info);
        });
    });
    document.getElementById('quit_close_btn').addEventListener('click', () => {
        document.body.removeChild(panel);
    });
    document.getElementById('quit_end_btn').addEventListener('click', () => {
        const selected_option = document.querySelector('input[name="quit_option"]:checked');
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
            jsPsych.endExperiment();
        }
    });
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
        message_progress_bar: langf.textProgressBar('en'),
    });
    const timeline = [];
    jsPsych;
    // Preload assets
    timeline.push({
        type: PreloadPlugin,
        auto_preload: true,
    });
    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: '',
        button_label: 'Fullscreen',
    });
    timeline.push(resize(jsPsych, 'en'));
    // Run numerosity task
    timeline.push(groupInstructions(jsPsych, 'people', 'en'), tipScreen('en'), partofexp(jsPsych, 'people', 'en', blocks_per_half, progress), instructions('objects', 'en'), groupInstructions(jsPsych, 'objects', 'en', true), tipScreen('en'), partofexp(jsPsych, 'objects', 'en', blocks_per_half, progress));
    await jsPsych.run(timeline);
    // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
    // if you handle results yourself, be it here or in `on_finish()`)
    return jsPsych;
}
