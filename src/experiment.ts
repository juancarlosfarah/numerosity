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
import { JsPsych, initJsPsych } from 'jspsych';

import '../styles/main.scss';

type img_description = { num: number; id: number };
type timeline = JsPsych['timeline'];

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
  console.log(timeline_variables);
  return timeline_variables;
}

function partofexp(
  jsPsych: JsPsych,
  cntable: 'people' | 'objects',
  nb_blocks: number = 5,
): timeline {
  const timeline_vars: img_description[] = generateTimelineVars(
    jsPsych,
    nb_blocks,
  );

  const timeline: timeline = {
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
          return `<img src='../assets/num_task_imgs/${cntable}/num_${jsPsych.timelineVariable('num')}_${jsPsych.timelineVariable('id')}.png'>`;
        },
        choices: 'NO_KEYS',
        trial_duration: 250,
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: 'How many ' + cntable + ' were in the virtual room?',
        html: '<input type="number" />',
      },
    ],
    timeline_variables: timeline_vars,
    sample: {
      type: 'custom',
      fn: function (t: number[]): number[] {
        const blocks: number = t.length / 4;
        let template: number[] = [];
        let intermediate: number[] = [];
        let new_t: number[] = [];
        for (let nums: number = 0; nums < 4; nums++) {
          template = [...Array(blocks).keys()].map((x) => x + nums * blocks);
          console.log(template);
          intermediate = intermediate.concat(
            jsPsych.randomization.shuffle(template),
          );
        }
        console.log(intermediate);
        for (let i: number = 0; i < blocks; i++) {
          const block: number[] = [];
          block.push(
            intermediate[i],
            intermediate[i + blocks],
            intermediate[i + 2 * blocks],
            intermediate[i + 3 * blocks],
          );
          new_t = new_t.concat(jsPsych.randomization.shuffle(block));
        }
        console.log(new_t);
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
export async function run(/*{
  assetPaths,
  input = {},
  environment,
  title,
  version,
}*/): Promise<JsPsych> {
  const jsPsych: JsPsych = initJsPsych();

  const timeline: timeline = [];

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

  const firsthalf: timeline = partofexp(jsPsych, 'people');
  const secondhalf: timeline = partofexp(jsPsych, 'objects');

  timeline.push(firsthalf, secondhalf);

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
