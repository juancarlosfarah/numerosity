/**
 * @title Numerosity
 * @description Social numerosity task.
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import { initJsPsych } from 'jspsych';
import '../styles/main.scss';
// Generate timeline variables following the img_description[] type described above.
// For each numerosity, "nb_block" images are randomly selected and put in a list ordered by numerosity.
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
//Generate timeline corresponding to half of numerosity task (people or objects).
// The order of stimuli correspond to the following pattern:
// There are "nb_blocks" blocks consisting of a random image from each numerosity (5,6,7,8) in random order.
// Two identical images will never be contained in one experiment.
function partofexp(jsPsych, cntable, nb_blocks = 5) {
    // Generate random timeline variables (pick random images for each numerosity).
    const timeline_vars = generateTimelineVars(jsPsych, nb_blocks);
    // Timeline that will be returned
    const timeline = {
        timeline: [
            // Crosshait shown before each image for 500ms.
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
                html: '<input type="number" />',
            },
        ],
        timeline_variables: timeline_vars,
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
    };
    return timeline;
}
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run( /*{
  assetPaths,
  input = {},
  environment,
  title,
  version,
}*/) {
    const jsPsych = initJsPsych();
    const timeline = [];
    // Preload assets
    timeline.push({
        type: PreloadPlugin,
        auto_preload: true,
    });
    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
    });
    // Run numerosity task
    timeline.push(partofexp(jsPsych, 'people'), partofexp(jsPsych, 'objects'));
    await jsPsych.run(timeline);
    // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
    // if you handle results yourself, be it here or in `on_finish()`)
    return jsPsych;
}
