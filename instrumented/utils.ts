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
