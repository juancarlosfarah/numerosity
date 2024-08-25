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
type imageDescription = { num: number; id: number; blackscreenJitter: number };
type timeline = JsPsych['timeline'];

/**
 * @function generateTimelineVars
 * @description Generate timeline variables for the experiment.
 * For each numerosity, "nbBlock" images are randomly selected and put in a list ordered by numerosity.
 * @param { JsPsych } JsPsych - The jsPsych instance
 * @param { number } nbBlocks - Number of blocks per numerosity
 * @returns { imageDescription[] } - Array of image descriptions
 */
function generateTimelineVars(
  JsPsych: JsPsych,
  nbBlocks: number,
): imageDescription[] {
  const timelineVariables: imageDescription[] = [];

  for (let num = 5; num <= 8; num++) {
    const idList: number[] = JsPsych.randomization.sampleWithoutReplacement(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      nbBlocks,
    );
    for (let i: number = 0; i < nbBlocks; i++) {
      timelineVariables.push({
        num: num,
        id: idList[i],
        blackscreenJitter: (Math.random() - 0.5) * 300,
      });
    }
  }
  return timelineVariables;
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
 * @param {number} nbBlocks - The number of blocks to be included in one half of the experiment.
 * @param {{ device: SerialPort | USBDevice | null, sendTriggerFunction: (device: SerialPort & USBDevice | null, trigger: string) => Promise<void> }} deviceInfo - An object containing the connected device (either `SerialPort` or `USBDevice`, or `null`) and a function to send triggers to the device.
 * @param {((device: SerialPort | null, trigger: string) => Promise<void>) | ((device: USBDevice | null, trigger: string) => Promise<void>)} sendTriggerFunction - A function that sends a trigger to the connected device, applicable to either `SerialPort` or `USBDevice`.
 *
 * @returns {timeline} - The timeline configuration object for one half of the numerosity task experiment.
 */
const partofexp: (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nbBlocks: number,
  deviceInfo: {
    device: (SerialPort & USBDevice) | null;
    sendTriggerFunction: (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => Promise<void>;
  },
) => timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nbBlocks: number,
  deviceInfo: {
    device: (SerialPort & USBDevice) | null;
    sendTriggerFunction: (
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
        1500 + jsPsych.evaluateTimelineVariable('blackscreenJitter'),
      on_start: (): void => {
        deviceInfo.sendTriggerFunction(deviceInfo.device, '0');
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
        deviceInfo.sendTriggerFunction(deviceInfo.device, '1');
        document.body.style.cursor = 'none';
      },
    },

    // Image is shown for 250ms
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        return `<img class="task-img" src='./assets/num-task-imgs/${cntable}/num-${jsPsych.evaluateTimelineVariable('num')}-${jsPsych.evaluateTimelineVariable('id')}.png' alt='task image'>`;
      },
      choices: 'NO_KEYS',
      trial_duration: 250,
      on_start: (): void => {
        deviceInfo.sendTriggerFunction(deviceInfo.device, '2');
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
        deviceInfo.sendTriggerFunction(deviceInfo.device, '3');
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
      buttonLabel: i18next.t('estimateSubmitBtn'),
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
        deviceInfo.sendTriggerFunction(deviceInfo.device, '4');
      },
      on_finish: function (): void {
        jsPsych.progressBar!.progress =
          Math.round(
            (jsPsych.progressBar!.progress + 1 / (8 * nbBlocks)) * 1000000,
          ) / 1000000;
      },
    },
  ],

  // Generate random timeline variables (pick random images for each numerosity).
  timeline_variables: generateTimelineVars(jsPsych, nbBlocks),
  sample: {
    type: 'custom',

    // Custom sampling function to produce semi-random pattern described in function description.
    fn: function (timelines: number[]): number[] {
      const blocks: number = timelines.length / 4;
      let template: number[] = [];
      let intermediate: number[] = [];
      let newTimelines: number[] = [];

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
        newTimelines = newTimelines.concat(
          jsPsych.randomization.shuffle(block),
        );
      }
      return newTimelines;
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
  const blocksPerHalf: number = 5;
  const connectType: 'Serial Port' | 'USB' | null = 'Serial Port';

  //Pseudo state variable
  let deviceInfo: {
    device: (SerialPort & USBDevice) | null;
    sendTriggerFunction: (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => Promise<void>;
  } = {
    device: null,
    sendTriggerFunction: async (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => {},
  };

  //initialize jspsych
  const jsPsych: JsPsych = initJsPsych({
    showProgressBar: true,
    autoUpdateProgressBar: false,
    messageProgressBar: i18next.t('progressBar'),
    on_finish: (): void => {
      jsPsych.data.get().localSave('csv', 'experiment-data.csv');
    },
  });

  // Randomize order of countables
  let expPartsCountables: ('people' | 'objects')[] = ['people', 'objects'];
  expPartsCountables = jsPsych.randomization.shuffle(expPartsCountables);

  //initiate timeline
  const timeline: timeline = [];

  //push trials to timeline
  jsPsych;
  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: generatePreloadStrings(),
  });

  if (connectType) {
    timeline.push(DeviceConnectPages(jsPsych, deviceInfo, connectType));
  }

  // Run numerosity task
  timeline.push(
    fullScreenPlugin(jsPsych),
    resize(jsPsych),
    groupInstructions(jsPsych, expPartsCountables[0]),
    tipScreen(),
    createButtonPage(
      i18next.t('experimentStart'),
      i18next.t('experimentStartBtn'),
    ),
    partofexp(jsPsych, expPartsCountables[0], blocksPerHalf, deviceInfo),
    createButtonPage(i18next.t('firstHalfEnd'), i18next.t('resizeBtn')),
    groupInstructions(jsPsych, expPartsCountables[1]),
    tipScreen(),
    createButtonPage(
      i18next.t('experimentStart'),
      i18next.t('experimentStartBtn'),
    ),
    partofexp(jsPsych, expPartsCountables[1], blocksPerHalf, deviceInfo),
  );

  await jsPsych.run(timeline);

  document
    .getElementsByClassName('jspsych-content-wrapper')[0]
    .setAttribute('style', 'overflow-x: hidden;');

  if (jsPsych.data.get().last(2).values()[0].trialType === 'quit-survey') {
    showEndScreen(i18next.t('abortedMessage'));
  } else {
    showEndScreen(i18next.t('endMessage'));
  }

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
