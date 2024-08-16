/**
 * @title Numerosity
 * @description Social numerosity task.
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
// Import required plugins and modules from jsPsych
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import i18next from 'i18next';
import { JsPsych, initJsPsych } from 'jspsych';

// Import styles
import '../styles/main.scss';
import { groupInstructions, tipScreen } from './instructions';
import { showEndScreen } from './quit';
import {
  DeviceConnectPages,
  fullScreenPlugin,
  generatePreloadStrings,
  resize,
} from './setup';
import {
  connectToSerial,
  connectToUSB,
  createButtonPage,
  sendTriggerToSerial,
  sendTriggerToUSB,
} from './utils';

// Type aliases for better code readability
type img_description = { num: number; id: number; bs_jitter: number };
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
const partofexp: (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nb_blocks: number,
  device_info: {
    device: (SerialPort & USBDevice) | null;
    send_trigger_func: (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => Promise<void>;
  },
) => timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nb_blocks: number,
  device_info: {
    device: (SerialPort & USBDevice) | null;
    send_trigger_func: (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => Promise<void>;
  },
): timeline => ({
  timeline: [
    // Blackscreen before stimuli
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: 'NO_KEYS',
      trial_duration: (): number =>
        1500 + jsPsych.evaluateTimelineVariable('bs_jitter'),
      on_start: (): void => {
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
      on_start: (): void => {
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
      on_start: (): void => {
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
      on_start: (): void => {
        device_info.send_trigger_func(device_info.device, '3');
        document.body.style.cursor = 'none';
      },
      on_finish: (): void => {
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
      on_start: (): void => {
        device_info.send_trigger_func(device_info.device, '4');
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
 * @description Initializes and runs the jsPsych experiment. This function sets up the experiment, including asset preloading, device configuration, resizing, and running the numerosity task. It handles experiment setup based on user-defined parameters, such as asset paths and connection types.
 * @param {Object} params - The parameters for the experiment.
 * @param {Object} params.assetPaths - Paths to the assets required for the experiment (images, audio, video).
 * @param {any} params.input - Additional input parameters for the experiment.
 * @param {string} params.environment - The environment in which the experiment is run.
 * @param {string} params.title - The title of the experiment.
 * @param {string} params.version - The version of the experiment.
 * @returns {Promise<JsPsych>} - A promise that resolves to the initialized jsPsych instance.
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}: {
  assetPaths: { images: string[]; audio: string[]; video: string[] };
  input: any;
  environment: string;
  title: string;
  version: string;
}): Promise<JsPsych> {
  //Parameters:
  const blocks_per_half: number = 5;
  const connect_type: 'Serial Port' | 'USB' | null = 'Serial Port';

  //Pseudo state variable
  let device_info: {
    device: (SerialPort & USBDevice) | null;
    send_trigger_func: (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => Promise<void>;
  } = {
    device: null,
    send_trigger_func: async (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => {},
  };

  //initialize jspsych
  const jsPsych: JsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: i18next.t('progressBar'),
    on_finish: (): void => {
      jsPsych.data.get().localSave('csv', 'experiment-data.csv');
    },
  });

  // Randomize order of countables
  let exp_parts_cntables: ('people' | 'objects')[] = ['people', 'objects'];
  exp_parts_cntables = jsPsych.randomization.shuffle(exp_parts_cntables);

  //initiate timeline
  const timeline: timeline = [];

  //push trials to timeline
  jsPsych;
  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: generatePreloadStrings(),
  });

  if (connect_type) {
    timeline.push(DeviceConnectPages(jsPsych, device_info, connect_type));
  }

  // Run numerosity task
  timeline.push(
    fullScreenPlugin(jsPsych),
    resize(jsPsych),
    groupInstructions(jsPsych, exp_parts_cntables[0]),
    tipScreen(),
    createButtonPage(
      i18next.t('experimentStart'),
      i18next.t('experimentStartBtn'),
    ),
    partofexp(jsPsych, exp_parts_cntables[0], blocks_per_half, device_info),
    createButtonPage(i18next.t('firstHalfEnd'), i18next.t('resizeBtn')),
    groupInstructions(jsPsych, exp_parts_cntables[1]),
    tipScreen(),
    createButtonPage(
      i18next.t('experimentStart'),
      i18next.t('experimentStartBtn'),
    ),
    partofexp(jsPsych, exp_parts_cntables[1], blocks_per_half, device_info),
  );

  await jsPsych.run(timeline);

  document
    .getElementsByClassName('jspsych-content-wrapper')[0]
    .setAttribute('style', 'overflow-x: hidden;');

  if (jsPsych.data.get().last(2).values()[0].trial_type === 'quit-survey') {
    showEndScreen(i18next.t('abortedMessage'));
  } else {
    showEndScreen(i18next.t('endMessage'));
  }

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
