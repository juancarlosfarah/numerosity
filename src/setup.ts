import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import JsResize from '@jspsych/plugin-resize';
import i18next from 'i18next';
import { DataCollection, JsPsych } from 'jspsych';

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
          `./assets/num-task-imgs/${cntable}/num-${num}-${id}.png`,
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
    const bar_resize_page: HTMLElement = document.createElement('div');

    bar_resize_page.id = 'bar-resize-page';
    bar_resize_page.style.top = `${document.getElementById('jspsych-progressbar-container')!.offsetHeight + 1}px`;
    bar_resize_page.classList.add('custom-overlay');
    bar_resize_page.innerHTML = ` <div>
                                    <p><b>${i18next.t('barResizeTitle')}</b></p>
                                    <br>
                                    <p>${i18next.t('barResizeInstructions')}</p>
                                    <br>
                                    <div id="resize-bar"></div>
                                    <br>
                                    <form id="bar-resize-form" style="text-align: center;">
                                      <div>  
                                        <label for="cm-bar-input">${i18next.t('barResizeInputLabel')}</label>
                                        <input id="cm-bar-input" type="number" min="0.001" step="0.001" placeholder="cm" required style="font-size: larger; margin-left: 5%; width: 10%;">
                                      </div>
                                      <br>
                                      <input type="submit" class="jspsych-btn" value="${i18next.t('resizeBtn')}">
                                    </form>
                                    <br>
                                    <button class="jspsych-btn" onclick="document.getElementById('bar-resize-page').style.display = 'none'" style="border: 2px solid red">${i18next.t('noRuler')}</button>`;
    document.body.appendChild(bar_resize_page);

    document
      .getElementById('bar-resize-form')!
      .addEventListener('submit', (event: SubmitEvent): void => {
        event.preventDefault();
        jsPsych.finishTrial({
          scale_factor:
            10 /
            Number(
              (document.getElementById('cm-bar-input') as HTMLInputElement)
                .value,
            ),
        });

        document.body.removeChild(
          document.getElementById('bar-resize-page') as Node,
        );
      });

    document.getElementById('cm-bar-input')!.focus();

    const resize_switch_btn: HTMLElement = document.createElement('div');
    resize_switch_btn.innerHTML = `<br><button class="jspsych-btn" onclick="document.getElementById('bar-resize-page').style.display = 'flex'" style="border: 2px solid red">${i18next.t('returnBarResize')}</button>`;
    document.getElementById('jspsych-content')!.appendChild(resize_switch_btn);
  },
  on_finish: () => {
    setSizes(jsPsych.data.get().last(1).values()[0].scale_factor);
    document.getElementById('jspsych-content')!.removeAttribute('style');
  },
});

function setSizes(scaling_factor: number = window.devicePixelRatio): void {
  const style: HTMLElement =
    document.getElementById('scaling') || document.createElement('style');

  const width_px: number = scaling_factor * 585.82677165;
  style.id = 'scaling';
  style.innerHTML = `img, vid {
        width: ${width_px}px; 
        height: ${(9 * width_px) / 16}px;
    }
    .inst-container {
      width: ${1.5 * width_px}px;
      height: ${(27 * width_px) / 32}px;
    }`;

  if (!style.parentElement) {
    document.head.appendChild(style);
  } else {
    console.error('Scaling factor cannot be applied.');
  }
}

export function USBConfigPages(
  jsPsych: JsPsych,
  devices: { device_obj: SerialPort | USBDevice | null },
  connect_function: () => Promise<USBDevice | SerialPort | null>,
): timeline {
  return {
    timeline: [
      {
        type: HtmlButtonResponsePlugin,
        stimulus: i18next.t('connectInstructions'),
        choices: [i18next.t('connectDeviceBtn'), i18next.t('skipConnect')],
        on_load: (): void => {
          document
            .getElementsByClassName('jspsych-btn')[0]
            .addEventListener('click', async () => {
              devices.device_obj = await connect_function();
              if (devices.device_obj !== null) {
                jsPsych.finishTrial();
              }
              document.getElementsByClassName('jspsych-btn')[0].innerHTML =
                i18next.t('retry');
              document.getElementById(
                'jspsych-html-button-response-stimulus',
              )!.innerHTML +=
                `<br><small style="color: red;">${i18next.t('connectFailed')}</small>`;
            });
        },
      },
    ],
    loop_function: function (data: DataCollection): boolean {
      return data.last(1).values()[0].response === 0;
    },
  };
}
