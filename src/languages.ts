// Type aliases for better code readability
type language = 'en' | 'fr' | 'es' | 'ca';

type quiz_questions = {
  prompt: string;
  options: string[];
  required: boolean;
}[];

type instruction_text = {
  title: string;
  example: string;
  btn_next: string;
  btn_previous: string;
  btn_end: string;
};

type tip_text = {
  title: string;
  description: string;
  btn_txt: string;
};

export function translateCalibration(lang: language): string {
  switch (lang) {
    case 'en':
      return 'Click and drag the lower right corner of the box until the box is the same size as a credit card held up to the screen.';
    case 'fr':
      return "Cliquez et faites glisser le coin inférieur droit de la boîte jusqu'à ce que la boîte ait la même taille qu'une carte de crédit tenue devant l'écran.";
    case 'es':
      return 'Haga clic y arrastre la esquina inferior derecha del cuadro hasta que tenga el mismo tamaño que una tarjeta de crédito sostenida en la pantalla.';
    case 'ca':
      return "Feu clic i arrossegueu l'extrem inferior dret del quadre fins que el quadre tingui la mateixa mida que una targeta de crèdit que es mostra a la pantalla.";
    default:
      console.error(lang + 'is not a valid language parameter.');
      return '';
  }
}

/**
 * @function textProgressBar
 * @description Returns the text for the progress bar based on the selected language.
 * @param {language} lang - The language in which the progress bar text is shown.
 * @returns {string} - The progress bar text in the specified language.
 */
export function textProgressBar(lang: language): string {
  switch (lang) {
    case 'en':
      return 'Completion progress';
    case 'fr':
      return "Progrès de l'expérience";
    case 'es':
      return 'Progreso del experimento';
    case 'ca':
      return "Progrés de l'experimentació";
    default:
      console.error(lang + 'is not a valid language parameter.');
      return '';
  }
}

/**
 * @function translateCountable
 * @description Translates 'people' or 'objects' based on the selected language.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects).
 * @param {language} lang - The language in which the countable text is shown.
 * @returns {string} - The translated countable text.
 */
export function translateCountable(
  cntable: 'people' | 'objects',
  lang: language,
): string {
  if (cntable === 'people') {
    switch (lang) {
      case 'en':
        return 'people';
      case 'fr':
        return 'personnes';
      case 'es':
        return 'personas';
      case 'ca':
        return 'persones';
      default:
        console.error(lang + 'is not a valid language parameter.');
        return '';
    }
  } else if (cntable === 'objects') {
    switch (lang) {
      case 'en':
        return 'objects';
      case 'fr':
        return 'objets';
      case 'es':
        return 'objetos';
      case 'ca':
        return 'objectes';
      default:
        console.error(lang + 'is not a valid language parameter.');
        return '';
    }
  } else {
    console.error(lang + 'is not a valid language parameter.');
    return '';
  }
}

/**
 * @function instructionTexts
 * @description Generates instruction texts based on the type of countable and language.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects).
 * @param {language} lang - The language in which instructions are shown.
 * @returns {instruction_text} - An object containing instruction texts.
 */
export function instructionTexts(
  cntable: 'people' | 'objects',
  lang: language,
): instruction_text {
  switch (lang) {
    case 'en':
      return {
        title: 'Instructions: what you have to do',
        example: `Here is an example of the task. As you can see, the picture is displayed for a very short time. You have to estimate the number of ${translateCountable(cntable, 'en')} that were displayed. Do not worry, estimation errors are expected.`,
        btn_next: 'Next',
        btn_previous: 'Previous',
        btn_end: 'I understand the instructions<br/>and I am ready to start',
      };
    case 'fr':
      return {
        title: 'Instructions: ce que vous devez faire',
        example: `Voici un exemple montrant le déroulement de la tâche. Comme vous pouvez le voir, l'image s'affiche durant un très court instant. Vous devez estimer le nombre d'${translateCountable(cntable, 'fr')} qui étaient affichées. Ne vous inquiétez pas, des erreurs d'estimation sont attendues.`,
        btn_next: 'Suivant',
        btn_previous: 'Précédent',
        btn_end: "J'ai compris les instructions<br/>et je souhaite commencer",
      };
    case 'es':
      return {
        title: 'Instrucciones: lo que tienes que hacer',
        example: `He aquí un ejemplo de la tarea. Como puede ver, la imagen se muestra durante muy poco tiempo. Tienes que estimar el número de ${translateCountable(cntable, 'es')} que se mostraron. No se preocupe, se esperan errores de estimación.`,
        btn_next: 'Siguiente',
        btn_previous: 'Anterior',
        btn_end: 'Comprendo las instrucciones<br/>y estoy listo para empezar',
      };
    case 'ca':
      return {
        title: 'Instruccions: el que has de fer',
        example: `Vet aquí un exemple de la tasca. Com podeu veure, la imatge es mostra durant molt poc temps. Heu d'estimar el nombre de ${translateCountable(cntable, 'ca')} que es van mostrar. No us preocupeu, s'esperen errors d'estimació.`,
        btn_next: 'Següent',
        btn_previous: 'Anterior',
        btn_end: 'Comprenc les instruccions<br/>i estic a punt per començar',
      };
    default:
      console.error(lang + 'is not a valid language parameter.');
      return {
        title: '',
        example: '',
        btn_next: '',
        btn_previous: '',
        btn_end: '',
      };
  }
}

/**
 * @function translatePreamble
 * @description Translates the preamble text based on whether it is the second half of the experiment and the selected language.
 * @param {boolean} second_half - Whether it is the second half of the experiment.
 * @param {language} lang - The language in which the preamble text is shown.
 * @returns {string} - The translated preamble text.
 */
export function translatePreamble(
  second_half: boolean,
  lang: language,
): string {
  const en_preamble: string = 'Check your knowledge before you begin!';
  const fr_preamble: string = 'Vérifiez vos connaissances avant de commencer!';
  const es_preamble: string = '¡Compruebe sus conocimientos antes de empezar!';
  const ca_preamble: string =
    'Comproveu els vostres coneixements abans de començar!';
  if (second_half) {
    switch (lang) {
      case 'en':
        return (
          'You are in the middle of the experiment!<br>Instructions have changed for the second half.' +
          en_preamble
        );
      case 'fr':
        return (
          "Vous êtes au milieu de l'expérience!<br>Instructions have changed for the second half." +
          fr_preamble
        );
      case 'es':
        return (
          'Estás en medio del experimento!<br>Las instrucciones han cambiado para la segunda parte.' +
          es_preamble
        );
      case 'ca':
        return (
          "Ets al mig de l'experiment!<br>Les instruccions han canviat per a la segona part." +
          ca_preamble
        );
      default:
        console.error(lang + 'is not a valid language parameter.');
        return '';
    }
  } else {
    switch (lang) {
      case 'en':
        return en_preamble;
      case 'fr':
        return fr_preamble;
      case 'es':
        return es_preamble;
      case 'ca':
        return ca_preamble;
      default:
        console.error(lang + 'is not a valid language parameter.');
        return '';
    }
  }
}

/**
 * @function quizQuestions
 * @description Generates quiz questions based on the type of countable and language.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects).
 * @param {language} lang - The language in which the quiz questions are shown.
 * @returns {quiz_questions} - An array of quiz questions.
 */
export function quizQuestions(
  cntable: 'people' | 'objects',
  lang: language,
): quiz_questions {
  switch (lang) {
    case 'en':
      return [
        {
          prompt: 'Question 1:  What should be estimate?',
          options: [
            'The size of the virtual room',
            'The duration of picture presentation',
            `The number of ${translateCountable(cntable, 'en')} inside the virtual room`,
          ],
          required: true,
        },
      ];
    case 'fr':
      return [
        {
          prompt: 'Question 1: Que devez-vous estimer?',
          options: [
            'La taille de la pièce',
            'La durée de présentation des images',
            `Le nombre d'${translateCountable(cntable, 'fr')} présents dans la pièce`,
          ],
          required: true,
        },
      ];

    case 'es':
      return [
        {
          prompt: 'Pregunta 1: ¿Qué debe estimarse?',
          options: [
            'El tamaño de la sala virtual',
            'La duración de la presentación de la imagen',
            `El número de ${translateCountable(cntable, 'es')} dentro de la sala virtual`,
          ],
          required: true,
        },
      ];

    case 'ca':
      return [
        {
          prompt: 'Pregunta 1: Què cal estimar?',
          options: [
            'La mida de la sala virtual',
            'La durada de la presentació de la imatge',
            `El nombre d'${translateCountable(cntable, 'ca')} dins de la sala virtual`,
          ],
          required: true,
        },
      ];
    default:
      console.error(lang + 'is not a valid language parameter.');
      return [
        {
          prompt: '',
          options: [],
          required: false,
        },
      ];
  }
}

export function translateRepeat(lang: language): string {
  switch (lang) {
    case 'en':
      return 'Click here to read the instructions again';
    case 'fr':
      return 'Cliquez ici pour lire les instructions à nouveau';
    case 'es':
      return 'Haga clic aquí para volver a leer las instrucciones';
    case 'ca':
      return 'Feu clic aquí per tornar a llegir les instruccions';
    default:
      console.error(lang + 'is not a valid language parameter.');
      return '';
  }
}

/**
 * @function translateTip
 * @description Retrieves tips text based on the specified language.
 * @param {language} lang - The language code for the tips text.
 * @returns {tip_text} - An object containing title, description, and button text for tips.
 */
export function translateTip(lang: language): tip_text {
  switch (lang) {
    case 'en':
      return {
        title: 'Some tips',
        description:
          'Please keep your face at around 50cm from your screen during the experiment.',
        btn_txt: 'I am ready to start',
      };
    case 'fr':
      return {
        title: 'Quelques conseils',
        description:
          "Placez vous à environ 50cm de votre écran pendant l'expérience.",
        btn_txt: 'Je souhaite commencer',
      };
    case 'es':
      return {
        title: 'Algunos consejos',
        description:
          'Por favor, mantén la cara a unos 50 cm de la pantalla durante el experimento.',
        btn_txt: 'Estoy listo para empezar',
      };
    case 'ca':
      return {
        title: 'Alguns consells',
        description:
          "Si us plau, manteniu la cara a uns 50 cm de la pantalla durant l'experiment.",
        btn_txt: 'Estic llest per començar',
      };
    default:
      console.error(lang + 'is not a valid language parameter.');
      return { title: '', description: '', btn_txt: '' };
  }
}

/**
 * @function inputInfo
 * @description Retrieves input information text based on the specified language.
 * @param {language} lang - The language code for the input information.
 * @returns {string} - The input information text.
 */
export function inputInfo(lang: language): string {
  switch (lang) {
    case 'en':
      return 'Please write a whole number';
    case 'fr':
      return 'Veuillez entrer un nombre entier';
    case 'es':
      return 'Por favor escribe un número entero';
    case 'ca':
      return 'Si us plau, escriviu un número enter';
    default:
      console.error(lang + 'is not a valid language parameter.');
      return '';
  }
}
