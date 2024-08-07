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
import { JsPsych, initJsPsych } from 'jspsych';

// Import styles
import '../styles/main.scss';
import { groupInstructions, tipScreen } from './instructions';
import { showEndScreen } from './quit';
import { generatePreloadStrings, resize } from './setup';

// Type aliases for better code readability
type img_description = { num: number; id: number };
type timeline = JsPsych['timeline'];

/**
 * @function generateTimelineVars
 * @description Generate timeline variables for the experiment.
 * For each numerosity, "nb_block" images are randomly selected and put in a list ordered by numerosity.
 * @param { JsPsych } JsPsych - The jsPsych instance
 * @param { number } nb_blocks - Number of blocks per numerosity
 * @returns { img_description[] } - Array of image descriptions
 */
function generateTimelineVars(
  JsPsych: JsPsych,
  nb_blocks: number,
): img_description[] {
  const timeline_variables: img_description[] = [];

  for (let num = 5; num <= 8; num++) {
    const id_list: number[] = JsPsych.randomization.sampleWithoutReplacement(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      nb_blocks,
    );
    for (let i: number = 0; i < nb_blocks; i++) {
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
const partofexp: (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nb_blocks: number,
) => timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nb_blocks: number,
): timeline => ({
  timeline: [
    // Crosshair shown before each image for 500ms.
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '+',
      choices: 'NO_KEYS',
      trial_duration: 500,
      on_start: (): void => {
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
      on_finish: (): void => {
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
      on_load: (): void => {
        const input: HTMLInputElement = document.getElementById(
          'task-input',
        ) as HTMLInputElement;

        // Initially set the custom validity message
        input.setCustomValidity(i18next.t('inputInfo'));

        // Add input event listener
        input.addEventListener('input', (): void => {
          // If the input value is not empty, clear the custom validity message
          input.setCustomValidity(
            input.value === '' ? i18next.t('inputInfo') : '',
          );
        });
      },
      on_finish: function (): void {
        jsPsych.progressBar!.progress =
          Math.round(
            (jsPsych.progressBar!.progress + 1 / (8 * nb_blocks)) * 1000000,
          ) / 1000000;
      },
    },
  ],

  // Generate random timeline variables (pick random images for each numerosity).
  timeline_variables: generateTimelineVars(jsPsych, nb_blocks),
  sample: {
    type: 'custom',

    // Custom sampling function to produce semi-random pattern described in function description.
    fn: function (t: number[]): number[] {
      const blocks: number = t.length / 4;
      let template: number[] = [];
      let intermediate: number[] = [];
      let new_t: number[] = [];

      // Shuffle all indices for timeline variables with same numerosity
      for (let nums: number = 0; nums < 4; nums++) {
        template = [...Array(blocks).keys()].map(
          (x): number => x + nums * blocks,
        );
        intermediate = intermediate.concat(
          jsPsych.randomization.shuffle(template),
        );
      }

      // Create and append block of four numerosities by picking one of each (shuffled) numerosity groups in template array.
      for (let i: number = 0; i < blocks; i++) {
        const block: number[] = [];
        block.push(
          intermediate[i],
          intermediate[i + blocks],
          intermediate[i + 2 * blocks],
          intermediate[i + 3 * blocks],
        );

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
export async function run(): Promise<JsPsych> {
  const blocks_per_half: number = 5;

  const jsPsych: JsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: i18next.t('progressBar'),
    on_finish: (): void => {
      jsPsych.data.get().localSave('json', 'experiment-data.json');
    },
  });
  const timeline: timeline = [];

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
  timeline.push(
    groupInstructions(jsPsych, 'people'),
    tipScreen(),
    partofexp(jsPsych, 'people', blocks_per_half),
    groupInstructions(jsPsych, 'objects', true),
    tipScreen(),
    partofexp(jsPsych, 'objects', blocks_per_half),
  );

  await jsPsych.run(timeline);

  if (jsPsych.data.get().last(2).values()[0].trial_type === 'quit-survey') {
    showEndScreen(i18next.t('abortedMessage'));
  } else {
    showEndScreen(i18next.t('endMessage'));
  }

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
