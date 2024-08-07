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
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import i18next from 'i18next';
import { initJsPsych } from 'jspsych';
// Import styles
import '../styles/main.scss';
import { groupInstructions, tipScreen } from './instructions';
import { showEndScreen } from './quit';
import { generatePreloadStrings, resize } from './setup';
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
 * @returns { timeline } - Timeline for one half of the numerosity task
 */
const partofexp = (jsPsych, cntable, nb_blocks) => ({
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
            button_label: i18next.t('estimateSubmitBtn'),
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
                jsPsych.progressBar.progress += 1 / (8 * nb_blocks);
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
 * @function run
 * @description This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment.
 * Initializes jsPsych, sets up the timeline, and runs the experiment.
 * @returns { Promise<JsPsych> } - Promise resolving to the jsPsych instance
 */
export async function run() {
    const blocks_per_half = 5;
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
        info: {
            name: 'PreloadPlugin',
            version: '8.0.1',
            data: {},
        },
    });
    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: '',
        button_label: i18next.t('fullscreen'),
        info: {
            name: 'FullscreenPlugin',
            version: '8.0.1',
            data: {},
        },
    });
    timeline.push(resize(jsPsych));
    // Run numerosity task
    timeline.push(groupInstructions(jsPsych, 'people'), tipScreen(), partofexp(jsPsych, 'people', blocks_per_half), groupInstructions(jsPsych, 'objects', true), tipScreen(), partofexp(jsPsych, 'objects', blocks_per_half));
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
