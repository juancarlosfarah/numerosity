/**
 * @function generatePreloadStrings
 * @description Generates a list of file paths for preloading images used in a numerical task.
 * @returns {string[]} - An array of file paths to be preloaded.
 */
export function generatePreloadStrings() {
    const cntables = ['people', 'objects'];
    const path_list = [];
    for (const cntable of cntables) {
        for (let num = 5; num < 9; num++) {
            for (let id = 0; id < 10; id++) {
                path_list.push(`./assets/num-task-imgs/${cntable}/num-${num}-${id}.png`);
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
/*
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
    //const width_px: number = jsPsych.data.get().last(1).values()[0].scale_factor * 559.37007874;
    const width_px: number = window.devicePixelRatio * 559.37007874;
    const style: HTMLElement = document.createElement('style');
    style.innerHTML = `img, vid, .inst-container {
        width: ${width_px}px;
        height: ${(9 * width_px) / 16}px;}`;
    document.head.appendChild(style);
  },
});
*/
function setSizes(scaling_element) {
    const width_px = window.devicePixelRatio * 559.37007874;
    scaling_element.setAttribute('id', 'scaling');
    scaling_element.innerHTML = `img, vid {
        width: ${width_px}px; 
        height: ${(9 * width_px) / 16}px;
    }
    .inst-container {
      width: ${1.5 * width_px}px;
      height: ${(27 * width_px) / 32}px;
    }`;
}
export function resize() {
    let remove = null;
    const updateSizes = () => {
        if (remove != null) {
            remove();
        }
        const pixel_ratio = window.devicePixelRatio;
        const mqString = `(resolution: ${pixel_ratio}dppx)`;
        const media = matchMedia(mqString);
        media.addEventListener('change', updateSizes);
        remove = () => {
            media.removeEventListener('change', updateSizes);
        };
        const style = document.getElementById('scaling') || document.createElement('style');
        setSizes(style);
        if (!style.parentElement) {
            document.head.appendChild(style);
        }
    };
    updateSizes();
}
