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
