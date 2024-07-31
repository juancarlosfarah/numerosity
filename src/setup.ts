import JsResize from '@jspsych/plugin-resize';
import i18next from 'i18next';
import { JsPsych } from 'jspsych';

import { quitBtnAction } from './quit';

// Type aliases for better code readability
type timeline = JsPsych['timeline'];

/**
 * @function generatePreloadStrings
 * @description Generates a list of file paths for preloading images used in a numerical task.
 * @returns {string[]} - An array of file paths to be preloaded.
 */
export function generatePreloadStrings(): string[] {
  const cntables: string[] = ['people', 'objects'];
  const path_list: string[] = [];

  for (const cntable of cntables) {
    for (let num: number = 5; num < 9; num++) {
      for (let id: number = 0; id < 10; id++) {
        path_list.push(
          `../assets/num-task-imgs/${cntable}/num-${num}-${id}.png`,
        );
      }
    }
  }

  return path_list;
}

/**
 * @function resize
 * @description Generates the resize timeline for the experiment with calibration and quit button.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @returns {timeline} - The timeline object for resizing.
 */
export const resize: (jsPsych: JsPsych) => timeline = (
  jsPsych: JsPsych,
): timeline => ({
  timeline: [
    {
      type: JsResize,
      item_width: 8.56,
      item_height: 5.398,
      prompt: `<p>${i18next.t('calibration')}</p>`,
      starting_size: 383,
      button_label: i18next.t('resizeBtn'),
      pixels_per_unit: 37.795275591,
    },
  ],
  on_load: function (): void {
    const quit_btn: HTMLButtonElement = document.createElement('button');
    quit_btn.setAttribute('type', 'button');
    quit_btn.setAttribute(
      'style',
      'color: #fff; border-radius: 4px; background-color: #1d2124; border-color: #171a1d; position: absolute; right: 1%; top: 50%; transform: translateY(-50%)',
    );

    quit_btn.addEventListener('click', () => quitBtnAction(jsPsych));

    quit_btn.appendChild(document.createTextNode(i18next.t('quitBtn')));

    document
      .getElementById('jspsych-progressbar-container')!
      .appendChild(quit_btn);
  },
  on_finish: function (): void {
    const style: HTMLElement = document.createElement('style');
    style.innerHTML = `img, vid {
        width: ${jsPsych.data.get().last(1).values()[0].scale_factor * 559.37007874}px;
        height: auto}`;
    document.head.appendChild(style);
  },
});
