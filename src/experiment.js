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
function generateTimelineVars() {
    const timeline_variables = [];
    for (let num = 5; num <= 8; num++) {
        for (let id = 0; id <= 9; id++) {
            timeline_variables.push({ num, id });
        }
    }
    return timeline_variables;
}
function partofexp(jsPsych, cntable, nb_trials = 20) {
    const timeline_vars = generateTimelineVars();
    let trials_done = 0;
    const partofexp = {
        timeline: [
            {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: '+',
                choices: 'NO_KEYS',
                trial_duration: 500,
            },
            {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: function () {
                    return `<img src='../assets/num_task_imgs/${cntable}num_${jsPsych.timelineVariable('num')}_${jsPsych.timelineVariable('id')}.png'>`;
                },
                choices: 'NO_KEYS',
                trial_duration: 2500,
            },
            {
                type: jsPsychSurveyHtmlForm,
                preamble: 'How many ' + cntable + ' were in the virtual room?',
                html: '<input type="number" />',
                on_finish: () => {
                    trials_done++;
                },
            },
        ],
        timeline_variables: timeline_vars,
        groups: [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            [10, 21, 22, 23, 24, 25, 26, 27, 28, 29],
            [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
        ],
        randomize_group_order: true,
        randomize_order: true,
        loop_function: function () {
            return trials_done < nb_trials;
        },
    };
    return partofexp;
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
    const firsthalf = partofexp(jsPsych, 'people');
    const secondhalf = partofexp(jsPsych, 'objects');
    timeline.push(firsthalf, secondhalf);
    await jsPsych.run(timeline);
    // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
    // if you handle results yourself, be it here or in `on_finish()`)
    return jsPsych;
}
