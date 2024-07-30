import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import jsPsychinstructions from '@jspsych/plugin-instructions';
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import i18next from 'i18next';
import { JsPsych } from 'jspsych';

//import { DataCollection } from 'jspsych/src/modules/data/DataCollection';
// Import styles and language functions
import * as langf from './languages.js';

// Type aliases for better code readability
type timeline = JsPsych['timeline'];

/**
 * @function generateInstructionPages
 * @description Generate instruction pages based on the type of countable (people/objects).
 * If example is true, it generates the example page with a video.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { string[] } - Array of instruction pages as HTML strings
 */
function generateInstructionPages(cntable: 'people' | 'objects'): string[] {
  const pages: string[] = [];
  for (let page_nb: number = 1; page_nb < 6; page_nb++) {
    pages.push(
      `<b>${i18next.t('instructionTitle')}</b><br><img src='../assets/instruction-media/${cntable}/${i18next.language}/instruction-${page_nb}.png'></img>`,
    );
  }
  pages.push(
    `<b>${i18next.t('instructionTitle')}</b><br>${i18next.t('instructionExample', { cntable: langf.translateCountable(cntable) })}<br><video muted autoplay loop preload="auto" src="../assets/instruction-media/${cntable}/example-vid.mp4"><source type="video/mp4"></source></video>`,
  );
  return pages;
}

/**
 * @function instructions
 * @description Create instruction timeline based on the type of countable.
 * Combines both text and example (video) instructions.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { timeline } - Timeline for instructions
 */
function instructions(cntable: 'people' | 'objects'): timeline {
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
const instructionQuiz: (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  second_half?: boolean,
) => timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  second_half: boolean = false,
): timeline => ({
  timeline: [
    {
      type: jsPsychSurveyMultiChoice,
      questions: langf.quizQuestions(cntable),
      preamble: `<b>${i18next.t('quizPreamblesHalf', { returnObjects: true })[Number(second_half)]}</b><br><br><button id="quiz-repeat-btn" class="jspsych-btn" style="cursor: pointer;">${i18next.t('repeatInstructions')}</button>`,
    },
  ],
  on_load: (): void => {
    document
      .getElementById('quiz-repeat-btn')!
      .addEventListener('click', (): void => {
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
const returnPage: (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
) => timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
): timeline => ({
  timeline: [
    {
      type: HtmlButtonResponsePlugin,
      stimulus: `<p><b>${i18next.t('repeatInstructions')}</b></p>`,
      choices: [i18next.t('repeatInstructions')],
    },
  ],
  conditional_function: function (): boolean {
    return (
      jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
        'read-again' &&
      jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
        langf.quizQuestions(cntable)[0].options[2]
    );
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
export const groupInstructions: (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  second_half?: boolean,
) => timeline = (
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  second_half: boolean = false,
): timeline => ({
  timeline: [
    instructions(cntable),
    instructionQuiz(jsPsych, cntable, second_half),
    returnPage(jsPsych, cntable),
  ],
  loop_function: function (data: timeline): boolean {
    return (
      data.last(2).values()[1].response.Q0 !==
      langf.quizQuestions(cntable)[0].options[2]
    );
  },
  on_finish: (): void => {
    jsPsych.getDisplayElement().innerHTML = '';
  },
});

/**
 * @function tipScreen
 * @description Generates a timeline object for displaying a tip screen.
 * @returns {timeline} - An object representing the timeline for the tip screen.
 */
export function tipScreen(): timeline {
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
