export function textProgressBar(lang) {
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
export function translateCountable(cntable, lang) {
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
    }
    else if (cntable === 'objects') {
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
    }
    else {
        console.error(lang + 'is not a valid language parameter.');
        return '';
    }
}
export function instructionTexts(cntable, lang) {
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
export function translatePreamble(second_half, lang) {
    if (second_half) {
        switch (lang) {
            case 'en':
                return 'You are in the middle of the experiment!<br>Instructions have changed for the second half.';
            case 'fr':
                return 'You are in the middle of the experiment!<br>Instructions have changed for the second half.';
            case 'es':
                return 'Estás en medio del experimento!<br>Las instrucciones han cambiado para la segunda parte.';
            case 'ca':
                return "Ets al mig de l'experiment!<br>Les instruccions han canviat per a la segona part.";
            default:
                console.error(lang + 'is not a valid language parameter.');
                return '';
        }
    }
    else {
        switch (lang) {
            case 'en':
                return 'Check your knowledge before you begin!';
            case 'fr':
                return 'Vérifiez vos connaissances avant de commencer!';
            case 'es':
                return '¡Compruebe sus conocimientos antes de empezar!';
            case 'ca':
                return 'Comproveu els vostres coneixements abans de començar!';
            default:
                console.error(lang + 'is not a valid language parameter.');
                return '';
        }
    }
}
export function quizQuestions(cntable, lang) {
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
export function inputInfo(lang) {
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
