import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import JsResize from '@jspsych/plugin-resize';
import i18next from 'i18next';
import { DataCollection, JsPsych } from 'jspsych';

import { quitBtnAction } from './quit';
import {
  connectToSerial,
  connectToUSB,
  sendTriggerToSerial,
  sendTriggerToUSB,
} from './utils';

type timeline = JsPsych['timeline'];

/**
 * @function generatePreloadStrings
 * @description Generates a list of file paths for preloading images used in a numerical task.
 * @returns {string[]} - An array of file paths to be preloaded.
 */
export function generatePreloadStrings(): string[] {
  const cntables: string[] = ['people', 'objects'];
  const path_list: string[] = [];

  // Use nested loops to construct the file paths
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
    // Create a custom overlay for bar resize instructions
    const bar_resize_page: HTMLElement = document.createElement('div');

    bar_resize_page.id = 'bar-resize-page';
    bar_resize_page.style.top = `${document.getElementById('jspsych-progressbar-container')!.offsetHeight + 1}px`;
    bar_resize_page.classList.add('custom-overlay');
    bar_resize_page.innerHTML = `
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

    // Handle form submission and calculate scale factor
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

    // Add button to return to bar resize page if needed
    const resize_switch_btn: HTMLElement = document.createElement('div');
    resize_switch_btn.innerHTML = `<br><button class="jspsych-btn" onclick="document.getElementById('bar-resize-page').style.display = 'flex'" style="border: 2px solid red">${i18next.t('returnBarResize')}</button>`;
    document.getElementById('jspsych-content')!.appendChild(resize_switch_btn);
  },
  on_finish: () => {
    // Apply scaling factor to images and other elements
    setSizes(jsPsych.data.get().last(1).values()[0].scale_factor);
    document.getElementById('jspsych-content')!.removeAttribute('style');
  },
});

/**
 * @function setSizes
 * @description Sets the sizes of images and containers based on a scaling factor.
 * @param {number} [scaling_factor=window.devicePixelRatio] - The scaling factor to apply.
 */
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

/**
 * @function DeviceConnectPages
 * @description Creates a timeline to guide the user through connecting a USB or Serial device, including options to handle connection errors and retries. The timeline consists of a page that instructs the user to connect the device and provides options for retrying the connection or switching to another connection type if the initial attempt fails.
 *
 * The function handles:
 * - Displaying instructions for connecting the device based on the connection type.
 * - Providing a button to initiate the connection attempt.
 * - Handling connection errors by allowing the user to retry or switch connection types.
 * - Updating the `device_info` object with the connected device and the appropriate trigger function.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to manage the experiment timeline.
 * @param {{ device: SerialPort | null | USBDevice | null, send_trigger_func: (device: SerialPort & USBDevice | null, trigger: string) => Promise<void> }} device_info - An object holding the connected device (either `SerialPort` or `USBDevice`, or `null`) and a function to send triggers to the device.
 * @param {() => Promise<SerialPort | null> | () => Promise<USBDevice | null>} connect_function - A function that attempts to connect to a USB or Serial device, returning a promise that resolves to the connected device or `null` if the connection fails.
 * @param {string} device_name - The name of the device to be connected, used in the connection instructions.
 *
 * @returns {timeline} - The timeline configuration object for managing the device connection process, including error handling and retry options.
 */
export function DeviceConnectPages(
  jsPsych: JsPsych,
  device_info: {
    device: (SerialPort | null) | (USBDevice | null);
    send_trigger_func: (
      device: (SerialPort & USBDevice) | null,
      trigger: string,
    ) => Promise<void>;
  },
  connect_function:
    | (() => Promise<SerialPort | null>)
    | (() => Promise<USBDevice | null>),
  device_name: string,
): timeline {
  const on_usb_page: boolean = connect_function === connectToUSB;
  return {
    timeline: [
      {
        type: HtmlButtonResponsePlugin,
        stimulus: `${i18next.t('connectInstructions', {
          connection: on_usb_page
            ? 'USB'
            : connect_function === connectToSerial
              ? 'Serial Port'
              : 'invalid connection type',
          device_name: device_name,
        })}<br>`,
        choices: [
          i18next.t('connectDeviceBtn'),
          i18next.t(on_usb_page ? 'skipConnection' : 'tryUSB'),
        ],
        on_load: (): void => {
          // Add event listener to the connect button
          document
            .getElementsByClassName('jspsych-btn')[0]
            .addEventListener('click', async () => {
              device_info.device = await connect_function();
              if (device_info.device !== null) {
                device_info.send_trigger_func = on_usb_page
                  ? sendTriggerToUSB
                  : sendTriggerToSerial;
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
      // Repeat the connection step if the user chooses to retry
      return data.last(1).values()[0].response === 0;
    },
    conditional_function: function (): boolean {
      if (on_usb_page) {
        return device_info.device === null ? true : false;
      } else {
        return true;
      }
    },
  };
}

export const fullScreenPlugin: (jsPsych: JsPsych) => timeline = (
  jsPsych: JsPsych,
) => ({
  type: FullscreenPlugin,
  fullscreen_mode: true,
  message: '',
  button_label: i18next.t('fullscreen'),
  on_load: function (): void {
    const quit_btn: HTMLButtonElement = document.createElement('button');
    quit_btn.type = 'button';
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
});
