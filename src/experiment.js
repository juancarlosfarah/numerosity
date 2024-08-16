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
import { quitBtnAction } from './quit';
import { DeviceConnectPages, generatePreloadStrings, resize } from './setup';
import { connectToSerial, connectToUSB, createButtonPage, } from './utils';
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
            timeline_variables.push({
                num: num,
                id: id_list[i],
                bs_jitter: (Math.random() - 0.5) * 300,
            });
        }
    }
    return timeline_variables;
}
/**
 * @function partofexp
 * @description Creates a timeline for one half of the numerosity task experiment. Each half consists of a series of blocks where images representing different numerosities (5, 6, 7, 8) are displayed in a random order. This ensures that no identical images are shown within the same experiment.
 *
 * The timeline includes:
 * - A black screen before stimuli presentation, with a customizable jitter duration.
 * - A crosshair displayed for 500ms before each image.
 * - A stimulus image shown for 250ms.
 * - A black screen following the image display.
 * - A survey asking participants to estimate the number of countable items (either people or objects) they observed.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to manage the experiment timeline.
 * @param {'people' | 'objects'} cntable - The type of countable items (either 'people' or 'objects') to be used in the experiment.
 * @param {number} nb_blocks - The number of blocks to be included in one half of the experiment.
 * @param {{ device: SerialPort | USBDevice | null, send_trigger_func: (device: SerialPort & USBDevice | null, trigger: string) => Promise<void> }} device_info - An object containing the connected device (either `SerialPort` or `USBDevice`, or `null`) and a function to send triggers to the device.
 * @param {((device: SerialPort | null, trigger: string) => Promise<void>) | ((device: USBDevice | null, trigger: string) => Promise<void>)} trigger_func - A function that sends a trigger to the connected device, applicable to either `SerialPort` or `USBDevice`.
 *
 * @returns {timeline} - The timeline configuration object for one half of the numerosity task experiment.
 */
const partofexp = (jsPsych, cntable, nb_blocks, device_info) => ({
    timeline: [
        // Blackscreen before stimuli
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '',
            choices: 'NO_KEYS',
            trial_duration: () => 1500 + jsPsych.evaluateTimelineVariable('bs_jitter'),
            on_start: () => {
                device_info.send_trigger_func(device_info.device, '0');
                document.body.style.cursor = 'none';
            },
        },
        // Crosshair shown before each image for 500ms.
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p style="font-size: 3cm;">+</p>',
            choices: 'NO_KEYS',
            trial_duration: 500,
            on_start: () => {
                device_info.send_trigger_func(device_info.device, '1');
                document.body.style.cursor = 'none';
            },
        },
        // Image is shown for 250ms
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                return `<img src='./assets/num-task-imgs/${cntable}/num-${jsPsych.evaluateTimelineVariable('num')}-${jsPsych.evaluateTimelineVariable('id')}.png' alt='task image'>`;
            },
            choices: 'NO_KEYS',
            trial_duration: 250,
            on_start: () => {
                device_info.send_trigger_func(device_info.device, '2');
                document.body.style.cursor = 'none';
            },
        },
        // Blackscreen after image
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '',
            choices: 'NO_KEYS',
            trial_duration: 1000,
            on_start: () => {
                device_info.send_trigger_func(device_info.device, '3');
                document.body.style.cursor = 'none';
            },
            on_finish: () => {
                document.body.style.cursor = 'auto';
            },
        },
        // Survey to ask how many countables (people/objects) were estimated.
        {
            type: jsPsychSurveyHtmlForm,
            preamble: `How many ${cntable} were in the virtual room?`,
            html: `<input type="number" label="numerosity input" name="num-input" id="task-input" required min="0" step="1" placeholder="${i18next.t('inputPlaceholder')}"><br>`,
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
            on_start: () => {
                device_info.send_trigger_func(device_info.device, '4');
            },
            on_finish: function () {
                jsPsych.progressBar.progress =
                    Math.round((jsPsych.progressBar.progress + 1 / (8 * nb_blocks)) * 1000000) / 1000000;
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
 * @description Initializes and runs the jsPsych experiment. This function sets up the experiment, including asset preloading, device configuration, resizing, and running the numerosity task. It handles experiment setup based on user-defined parameters, such as asset paths and connection types.
 * @param {Object} params - The parameters for the experiment.
 * @param {Object} params.assetPaths - Paths to the assets required for the experiment (images, audio, video).
 * @param {any} params.input - Additional input parameters for the experiment.
 * @param {string} params.environment - The environment in which the experiment is run.
 * @param {string} params.title - The title of the experiment.
 * @param {string} params.version - The version of the experiment.
 * @returns {Promise<JsPsych>} - A promise that resolves to the initialized jsPsych instance.
 */
export async function run({ assetPaths, input = {}, environment, title, version, }) {
    //Parameters:
    const blocks_per_half = 5;
    const device_name = 'Arduino Micro';
    let device_info = {
        device: null,
        send_trigger_func: async (device, trigger) => { },
    };
    const jsPsych = initJsPsych({
        show_progress_bar: true,
        auto_update_progress_bar: false,
        message_progress_bar: i18next.t('progressBar'),
        on_finish: () => {
            jsPsych.data.get().localSave('csv', 'experiment-data.csv');
        },
    });
    const timeline = [];
    jsPsych;
    // Preload assets
    timeline.push({
        type: PreloadPlugin,
        images: generatePreloadStrings(),
    });
    timeline.push(DeviceConnectPages(jsPsych, device_info, connectToSerial, device_name), DeviceConnectPages(jsPsych, device_info, connectToUSB, device_name));
    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: '',
        button_label: i18next.t('fullscreen'),
        on_load: function () {
            const quit_btn = document.createElement('button');
            quit_btn.type = 'button';
            quit_btn.setAttribute('style', 'color: #fff; border-radius: 4px; background-color: #1d2124; border-color: #171a1d; position: absolute; right: 1%; top: 50%; transform: translateY(-50%)');
            quit_btn.addEventListener('click', () => quitBtnAction(jsPsych));
            quit_btn.appendChild(document.createTextNode(i18next.t('quitBtn')));
            document
                .getElementById('jspsych-progressbar-container')
                .appendChild(quit_btn);
        },
    });
    timeline.push(resize(jsPsych));
    // Randomize order of countables
    let exp_parts_cntables = ['people', 'objects'];
    exp_parts_cntables = jsPsych.randomization.shuffle(exp_parts_cntables);
    // Run numerosity task
    timeline.push(groupInstructions(jsPsych, exp_parts_cntables[0]), tipScreen(), createButtonPage(i18next.t('experimentStart'), i18next.t('experimentStartBtn')), partofexp(jsPsych, exp_parts_cntables[0], blocks_per_half, device_info), createButtonPage(i18next.t('firstHalfEnd'), i18next.t('resizeBtn')), groupInstructions(jsPsych, exp_parts_cntables[1]), tipScreen(), createButtonPage(i18next.t('experimentStart'), i18next.t('experimentStartBtn')), partofexp(jsPsych, exp_parts_cntables[1], blocks_per_half, device_info));
    await jsPsych.run(timeline);
    document
        .getElementsByClassName('jspsych-content-wrapper')[0]
        .setAttribute('style', 'overflow-x: hidden;');
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
