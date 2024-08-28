import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import JsResize from '@jspsych/plugin-resize';
import i18next from 'i18next';
import { quitBtnAction } from './quit';
import { connectToSerial, connectToUSB, sendTriggerToSerial, sendTriggerToUSB, } from './utils';
/**
 * @function generatePreloadStrings
 * @description Generates a list of file paths for preloading images used in a numerical task.
 * @returns {string[]} - An array of file paths to be preloaded.
 */
export function generatePreloadStrings() {
    const cntables = ['people', 'objects'];
    const pathList = [];
    // Use nested loops to construct the file paths
    for (const cntable of cntables) {
        for (let num = 5; num < 9; num++) {
            for (let id = 0; id < 10; id++) {
                pathList.push(`./assets/num-task-imgs/${cntable}/num-${num}-${id}.png`);
            }
        }
    }
    return pathList;
}
/**
 * @function DeviceConnectPages
 * @description Creates a timeline to guide the user through the process of connecting a USB or Serial device, with options for handling connection errors and retries. The timeline consists of a page that provides instructions for connecting the device and allows the user to attempt the connection, retry if it fails, or skip the connection process entirely.
 *
 * The function handles:
 * - Displaying connection instructions based on the specified connection type (USB or Serial).
 * - Providing a button to initiate the connection attempt.
 * - Handling connection failures by allowing the user to retry the connection or skip it.
 * - Updating the `deviceInfo` object with the connected device and the appropriate trigger function based on the connection type.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to manage the experiment timeline.
 * @param {{ device: SerialPort | USBDevice | null, sendTriggerFunction: (device: SerialPort | USBDevice | null, trigger: string) => Promise<void> }} deviceInfo - An object that holds the connected device, which can be either `SerialPort` or `USBDevice`, or `null`, and a function to send triggers to the device.
 * @param {'Serial Port' | 'USB'} connectType - The type of connection being established, either 'Serial Port' or 'USB'.
 *
 * @returns {timeline} - The timeline configuration object for managing the device connection process, including error handling and retry options.
 */
export function DeviceConnectPages(jsPsych, deviceInfo, connectType) {
    const serialConnect = connectType === 'Serial Port';
    const connectFunction = serialConnect
        ? connectToSerial
        : connectToUSB;
    return {
        timeline: [
            {
                type: HtmlButtonResponsePlugin,
                stimulus: `${i18next.t('connectInstructions', {
                    connection: connectType,
                })}<br>`,
                choices: [i18next.t('connectDeviceBtn'), i18next.t('skipConnect')],
                on_load: () => {
                    // Add event listener to the connect button
                    document
                        .getElementsByClassName('jspsych-btn')[0]
                        .addEventListener('click', async () => {
                        deviceInfo.device = await connectFunction();
                        if (deviceInfo.device !== null) {
                            deviceInfo.sendTriggerFunction = serialConnect
                                ? sendTriggerToSerial
                                : sendTriggerToUSB;
                            jsPsych.finishTrial();
                        }
                        document.getElementsByClassName('jspsych-btn')[0].innerHTML =
                            i18next.t('retry');
                        document.getElementById('jspsych-html-button-response-stimulus').innerHTML +=
                            `<br><small style="color: red;">${i18next.t('connectFailed')}</small>`;
                    });
                },
            },
        ],
        loop_function: function (data) {
            // Repeat the connection step if the user chooses to retry
            return data.last(1).values()[0].response === 0;
        },
    };
}
/**
 * @function fullScreenPlugin
 * @description Creates a timeline configuration for enabling fullscreen mode during the experiment. This configuration includes a button for participants to enter fullscreen mode and a custom "Quit" button that allows them to exit the experiment if needed.
 *
 * The trial includes:
 * - Fullscreen mode activation with an optional customizable message.
 * - A "Quit" button added to the screen, which allows participants to exit the experiment at any time.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to manage the experiment timeline.
 *
 * @returns {timeline} - The timeline configuration object for enabling fullscreen mode with an additional quit button.
 */
export const fullScreenPlugin = (jsPsych) => ({
    type: FullscreenPlugin,
    fullscreen_mode: true,
    message: '',
    button_label: i18next.t('fullscreen'),
    on_load: function () {
        const quitButton = document.createElement('button');
        quitButton.type = 'button';
        quitButton.setAttribute('style', 'color: #fff; border-radius: 4px; background-color: #1d2124; border-color: #171a1d; position: absolute; right: 1%; top: 50%; transform: translateY(-50%)');
        quitButton.addEventListener('click', () => quitBtnAction(jsPsych));
        quitButton.appendChild(document.createTextNode(i18next.t('quitBtn')));
        document
            .getElementById('jspsych-progressbar-container')
            .appendChild(quitButton);
    },
});
/**
 * @function autoResize
 * @description Automatically adjusts the scale factor of the experiment display based on the device's pixel ratio. This function ensures that the experiment is correctly resized when the device's resolution changes. It continuously monitors for changes in the device's pixel ratio and updates the display accordingly.
 *
 * The function includes:
 * - Detection of the device's pixel ratio using `window.devicePixelRatio`.
 * - Continuous monitoring of changes in the pixel ratio, adjusting the scale factor in real-time.
 * - Clean-up of event listeners to prevent memory leaks.
 *
 * @returns {number} - The scale factor determined by the device's pixel ratio.
 */
function autoResize() {
    let remove = null;
    const updateSizes = () => {
        if (remove != null) {
            remove();
        }
        const pixelRatio = window.devicePixelRatio;
        const mqString = `(resolution: ${pixelRatio}dppx)`;
        const media = matchMedia(mqString);
        media.addEventListener('change', updateSizes);
        remove = () => {
            media.removeEventListener('change', updateSizes);
        };
        return pixelRatio;
    };
    const scaleFactor = updateSizes();
    return scaleFactor;
}
/**
 * @function resize
 * @description Generates the resize timeline for the experiment with calibration and quit button.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @returns {timeline} - The timeline object for resizing.
 */
export const resize = (jsPsych) => ({
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
    on_load: function () {
        // Create a custom overlay for bar resize instructions
        const barResizePage = document.createElement('div');
        barResizePage.id = 'bar-resize-page';
        barResizePage.style.top = `${document.getElementById('jspsych-progressbar-container').offsetHeight + 1}px`;
        barResizePage.classList.add('custom-overlay');
        barResizePage.innerHTML = `
                                    <p><b>${i18next.t('barResizeTitle')}</b></p>
                                    <p style="text-align: center;">${i18next.t('barResizeInstructions')}</p>
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
                                    <div style="display: flex; align-items: center; text-align: center;">
                                      <h1 class="warning"><b>!</b></h1><p style="max-width: 75%; text-align: start;">${i18next.t('noRuler')}</p>
                                    </div>
                                    <button class="jspsych-btn" type="button" onclick="document.body.removeChild(document.getElementById('bar-resize-page'))">${i18next.t('noRulerBtn')}</button>`;
        document.body.appendChild(barResizePage);
        // Handle form submission and calculate scale factor
        document
            .getElementById('bar-resize-form')
            .addEventListener('submit', (event) => {
            event.preventDefault();
            jsPsych.finishTrial({
                scaleFactor: 10 /
                    Number(document.getElementById('cm-bar-input')
                        .value),
            });
            document.body.removeChild(document.getElementById('bar-resize-page'));
        });
        document.getElementById('cm-bar-input').focus();
        // Add button to return to bar resize page if needed
        const resizeSwitchButton = document.createElement('div');
        resizeSwitchButton.innerHTML = `<br><button class="jspsych-btn">${i18next.t('autoResizeBtn')}</button>`;
        resizeSwitchButton.addEventListener('click', () => {
            jsPsych.finishTrial({ scaleFactor: autoResize() });
        });
        document.getElementById('jspsych-content').appendChild(resizeSwitchButton);
    },
    on_finish: () => {
        // Apply scaling factor to images and other elements
        setSizes(jsPsych.data.get().last(1).values()[0].scaleFactor);
        document.getElementById('jspsych-content').removeAttribute('style');
    },
});
/**
 * @function setSizes
 * @description Sets the sizes of images and containers based on a scaling factor.
 * @param {number} [scalingFactor=window.devicePixelRatio] - The scaling factor to apply.
 */
function setSizes(scalingFactor = window.devicePixelRatio) {
    const style = document.getElementById('scaling') || document.createElement('style');
    const widthPixels = scalingFactor * 585.82677165;
    style.id = 'scaling';
    style.innerHTML = `.task-img, vid {
        width: ${widthPixels}px; 
        height: ${(9 * widthPixels) / 16}px;
    }
`;
    if (!style.parentElement) {
        document.head.appendChild(style);
    }
    else {
        console.error('Scaling factor cannot be applied.');
    }
}
