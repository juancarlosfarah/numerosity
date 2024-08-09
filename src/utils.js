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
