export function activateMQCunderline() {
    const responses = document.querySelectorAll('.jspsych-survey-multi-choice-text');
    responses.forEach((response) => response.addEventListener('click', () => {
        responses.forEach((response) => response.classList.remove('underlined'));
        response.classList.add('underlined');
    }));
}
