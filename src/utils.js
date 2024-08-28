import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
/**
 * @function activateMQCunderline
 * @description Adds an underline to the selected response in a multiple-choice survey by adding the 'underlined' class to the clicked element. Removes the underline from other elements.
 */
export function activateMQCunderline() {
    const responses = document.querySelectorAll('.jspsych-survey-multi-choice-text');
    responses.forEach((response) => response.addEventListener('click', () => {
        responses.forEach((response) => response.classList.remove('underlined'));
        response.classList.add('underlined');
    }));
}
/**
 * @function createButtonPage
 * @description Creates a button trial object for use in jsPsych, with a stimulus text and a single button choice.
 * @param {string} pageText - The text to display on the page.
 * @param {string} btnText - The text to display on the button.
 * @returns {buttonTrial} - An object containing the trial configuration.
 */
export function createButtonPage(pageText, btnText) {
    return {
        type: HtmlButtonResponsePlugin,
        stimulus: `<b>${pageText}</b><br><br>`,
        choices: [btnText],
    };
}
/**
 * @function connectToSerial
 * @description Prompts the user to select a serial port and then opens it with specified settings.
 * @returns {Promise<SerialPort | null>} - A Promise that resolves to the connected SerialPort object or null if the connection fails.
 */
export async function connectToSerial() {
    try {
        // Request a serial port from the user
        const port = await navigator.serial.requestPort();
        // Open the serial port with desired settings
        await port.open({ baudRate: 9600 }); // Adjust baudRate as needed
        console.log('Serial Port Opened');
        return port;
    }
    catch (error) {
        console.error('Serial Port Connection Error:', error);
        return null;
    }
}
/**
 * @function connectToUSB
 * @description Prompts the user to select a USB device and then connects to it with specified settings.
 * @returns {Promise<USBDevice | null>} - A Promise that resolves to the connected USBDevice object or null if the connection fails.
 */
export async function connectToUSB() {
    try {
        const device = await navigator.usb.requestDevice({
            filters: [{ vendorId: 0x2341, productId: 0x8037 }], // Replace with your device's vendorId and productId
        });
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);
        return device;
    }
    catch (error) {
        console.error('USB Connection Error:', error);
        return null;
    }
}
/**
 * @function sendTriggerToSerial
 * @description Sends a trigger string to the connected serial port.
 * @param {SerialPort | null} device - The connected serial port device.
 * @param {string} trigger - The trigger string to send.
 * @returns {Promise<void>} - A Promise that resolves when the trigger has been sent.
 */
export async function sendTriggerToSerial(device, trigger) {
    try {
        if (device) {
            const writer = device.writable.getWriter();
            const encoder = new TextEncoder();
            await writer.write(encoder.encode(trigger));
            console.log('Trigger sent:', trigger);
            writer.releaseLock();
        }
        else {
            console.log(`No serial port connected. Tried to send ${trigger}`);
        }
    }
    catch (error) {
        console.error('Failed to send trigger:', error);
    }
}
/**
 * @function sendTriggerToUSB
 * @description Sends a trigger string to the connected USB device.
 * @param {USBDevice | null} device - The connected USB device.
 * @param {string} trigger - The trigger string to send.
 * @returns {Promise<void>} - A Promise that resolves when the trigger has been sent.
 */
export async function sendTriggerToUSB(device, trigger) {
    try {
        if (device) {
            const encoder = new TextEncoder();
            await device.transferOut(1, encoder.encode(trigger));
            console.log('Trigger sent:', trigger);
        }
        else {
            console.log(`No USB device connected. Tried to send ${trigger}`);
        }
    }
    catch (error) {
        console.error('Failed to send trigger:', error);
    }
}
