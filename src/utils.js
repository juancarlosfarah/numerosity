import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
export function activateMQCunderline() {
    const responses = document.querySelectorAll('.jspsych-survey-multi-choice-text');
    responses.forEach((response) => response.addEventListener('click', () => {
        responses.forEach((response) => response.classList.remove('underlined'));
        response.classList.add('underlined');
    }));
}
export function createButtonPage(page_txt, btn_txt) {
    return {
        type: HtmlButtonResponsePlugin,
        stimulus: `<b>${page_txt}</b><br><br>`,
        choices: [btn_txt],
    };
}
export async function connectToSerial() {
    try {
        // Request a serial port from the user
        const port = await navigator.serial.requestPort();
        // Open the serial port with desired settings
        await port.open({ baudRate: 9600 }); // Adjust baudRate as needed
        // Configure serial port settings if needed (e.g., baud rate, data bits, etc.)
        console.log('Serial Port Opened');
        return port;
    }
    catch (error) {
        console.error('Serial Port Connection Error:', error);
        return null;
    }
}
// Helper function to connect to the USB device
export async function connectToUSB() {
    try {
        const device = await navigator.usb.requestDevice({
            filters: [{ vendorId: 0x2341, productId: 0x8037 }],
        }); // Replace with your device's vendorId
        await device.open();
        await device.selectConfiguration(1);
        console.log(device.configuration?.interfaces);
        await device.claimInterface(0);
        return device;
    }
    catch (error) {
        console.error('USB Connection Error:', error);
        return null;
    }
}
export async function sendTriggerToSerial(device, trigger) {
    try {
        if (port) {
            // Get the writer from the port's writable stream
            const writer = port.writable.getWriter();
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
// Helper function to send data to the USB device
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
