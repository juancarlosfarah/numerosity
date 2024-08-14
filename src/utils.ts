import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';

type button_trial = {
  type: typeof HtmlButtonResponsePlugin;
  stimulus: string;
  choices: string[];
};

export function activateMQCunderline(): void {
  const responses: NodeListOf<Element> = document.querySelectorAll(
    '.jspsych-survey-multi-choice-text',
  );

  responses.forEach((response) =>
    response.addEventListener('click', () => {
      responses.forEach((response) => response.classList.remove('underlined'));
      response.classList.add('underlined');
    }),
  );
}

export function createButtonPage(
  page_txt: string,
  btn_txt: string,
): button_trial {
  return {
    type: HtmlButtonResponsePlugin,
    stimulus: `<b>${page_txt}</b><br><br>`,
    choices: [btn_txt],
  };
}

export async function connectToSerial(): Promise<SerialPort | null> {
  try {
    // Request a serial port from the user
    const port: SerialPort = await navigator.serial.requestPort({
      filters: [{ usbVendorId: 0x2341, usbProductId: 0x8037 }], // Adjust filter to match your device
    });

    // Open the serial port with desired settings
    await port.open({ baudRate: 9600 }); // Adjust baudRate as needed

    return port;
  } catch (error) {
    console.error('Serial Port Connection Error:', error);
    return null;
  }
}

export async function sendTriggerToSerial(
  port: SerialPort | null,
  trigger: string,
): Promise<void> {
  try {
    if (port) {
      // Get the writer from the port's writable stream
      const writer: WritableStreamDefaultWriter<Uint8Array> =
        port.writable!.getWriter();
      const encoder: TextEncoder = new TextEncoder();
      await writer.write(encoder.encode(trigger));
      writer.releaseLock();
    } else {
      console.log(`No serial port connected. Tried to send ${trigger}`);
    }
  } catch (error) {
    console.error('Failed to send trigger:', error);
  }
}
