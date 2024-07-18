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
import jsPsychinstructions from '@jspsych/plugin-instructions';
import PreloadPlugin from '@jspsych/plugin-preload';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import { JsPsych, initJsPsych } from 'jspsych';
import { DataCollection } from 'jspsych/dist/modules/data/DataCollection';

import '../styles/main.scss';
import * as langf from './languages.js';

// Type aliases
type img_description = { num: number; id: number };
type timeline = JsPsych['timeline'];
type language = 'en' | 'fr' | 'es' | 'ca';
type instruction_text = {
  title: string;
  example: string;
  btn_next: string;
  btn_previous: string;
  btn_end: string;
};

function generateInstructionPages(
  cntable: 'people' | 'objects',
  lang: language,
  text: instruction_text,
  example: boolean = false,
): string[] {
  if (example === false) {
    const pages: string[] = [];
    for (let page_nb: number = 1; page_nb < 6; page_nb++) {
      pages.push(
        text.title +
          `<br><img src='../assets/instruction_media/${cntable}/${lang}/instruction_${page_nb}.png'></img>`,
      );
    }
    return pages;
  } else {
    return [
      text.title +
        '<br>' +
        text.example +
        `<br><video muted autoplay loop preload="auto"><source type="video/mp4" src="../assets/instruction_media/${cntable}/example_vid.mp4" ></source></video>`,
    ];
  }
}

//Timeline of instructions shown depending on countable (people/objects)
function instructions(cntable: 'people' | 'objects', lang: language): timeline {
  const text: instruction_text = langf.instructionTexts(cntable, lang);
  return {
    timeline: [
      {
        type: jsPsychinstructions,
        pages: generateInstructionPages(cntable, lang, text),
        button_label_next: text.btn_next,
        button_label_previous: text.btn_previous,
        show_clickable_nav: true,
      },
      {
        type: jsPsychinstructions,
        pages: generateInstructionPages(cntable, lang, text, true),
        button_label_next: text.btn_end,
        button_label_previous: text.btn_previous,
        show_clickable_nav: true,
      },
    ],
  };
}

const instructionQuiz: timeline = (
  cntable: 'people' | 'objects',
  lang: language,
  second_half: boolean = false,
): timeline => ({
  timeline: [
    {
      type: jsPsychSurveyMultiChoice,
      questions: langf.quizQuestions(cntable, lang),
      preamble: langf.translatePreamble(second_half, lang),
    },
  ],
  loop_function: function (data: DataCollection): boolean {
    return (
      data.values()[0].response.Q0 !==
      langf.quizQuestions(cntable, lang)[0].options[2]
    );
  },
});

// Generate timeline variables following the img_description[] type described above.
// For each numerosity, "nb_block" images are randomly selected and put in a list ordered by numerosity.
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
    for (let i = 0; i < nb_blocks; i++) {
      timeline_variables.push({ num: num, id: id_list[i] });
    }
  }
  return timeline_variables;
}

// Timeline corresponding to half of numerosity task (people or objects).
// The order of stimuli correspond to the following pattern:
// There are "nb_blocks" blocks consisting of a random image from each numerosity (5,6,7,8) in random order.
// Two identical images will never be contained in one experiment.
const partofexp: timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  lang: language,
  nb_blocks: number,
  progress: { completed: number },
): timeline => ({
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
      html: '<input type="number" id="task_input" required><br>',
      autofocus: 'task_input',
      on_load: (): void => {
        const input: HTMLInputElement = document.getElementById(
          'task_input',
        ) as HTMLInputElement;

        // Initially set the custom validity message
        input.setCustomValidity(langf.inputInfo(lang));

        // Add input event listener
        input.addEventListener('input', () => {
          // If the input value is not empty, clear the custom validity message
          if (input.value === '') {
            input.setCustomValidity(langf.inputInfo(lang));
          } else {
            input.setCustomValidity('');
          }
        });
      },
      on_finish: function (): void {
        progress.completed++;
        jsPsych.setProgressBar(progress.completed / (8 * nb_blocks));
        console.log(progress);
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
        template = [...Array(blocks).keys()].map((x) => x + nums * blocks);
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
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run(/*{
  assetPaths,
  input = {},
  environment,
  title,
  version,
}*/): Promise<JsPsych> {
  const blocks_per_half: number = 5;
  const progress: { completed: number } = { completed: 0 };

  const jsPsych: JsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: langf.textProgressBar('en'),
  });
  const timeline: timeline = [];

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
  });

  // Run numerosity task
  timeline.push(
    instructions('people', 'en'),
    instructionQuiz('people', 'en'),
    partofexp(jsPsych, 'people', 'en', blocks_per_half, progress),
    instructions('objects', 'en'),
    instructionQuiz('objects', 'en', true),
    partofexp(jsPsych, 'objects', 'en', blocks_per_half, progress),
  );

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
