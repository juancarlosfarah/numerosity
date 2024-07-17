/**
 * @title Numerosity
 * @description Social numerosity task.
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychinstructions from '@jspsych/plugin-instructions';
import PreloadPlugin from '@jspsych/plugin-preload';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import { initJsPsych } from 'jspsych';
import '../styles/main.scss';
function inputInfo(lang) {
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
// Generate timeline variables following the img_description[] type described above.
// For each numerosity, "nb_block" images are randomly selected and put in a list ordered by numerosity.
function generateTimelineVars(JsPsych, nb_blocks) {
    const timeline_variables = [];
    for (let num = 5; num <= 8; num++) {
        const id_list = JsPsych.randomization.sampleWithoutReplacement([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nb_blocks);
        for (let i = 0; i < nb_blocks; i++) {
            timeline_variables.push({ num: num, id: id_list[i] });
        }
    }
    return timeline_variables;
}
// Timeline corresponding to half of numerosity task (people or objects).
// The order of stimuli correspond to the following pattern:
// There are "nb_blocks" blocks consisting of a random image from each numerosity (5,6,7,8) in random order.
// Two identical images will never be contained in one experiment.
const partofexp = (jsPsych, cntable, lang, nb_blocks = 5) => ({
    timeline: [
        // Crosshair shown before each image for 500ms.
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '+',
            choices: 'NO_KEYS',
            trial_duration: 500,
        },
        // Image is shown for 250ms
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                return `<img src='../assets/num_task_imgs/${cntable}/num_${jsPsych.timelineVariable('num')}_${jsPsych.timelineVariable('id')}.png'>`;
            },
            choices: 'NO_KEYS',
            trial_duration: 250,
        },
        // Survey to ask how many countables (people/objects) were estimated.
        {
            type: jsPsychSurveyHtmlForm,
            preamble: 'How many ' + cntable + ' were in the virtual room?',
            html: '<input type="number" id="task_input" required><br>',
            autofocus: 'task_input',
            on_load: () => {
                const input = document.getElementById('task_input');
                input.setCustomValidity(inputInfo(lang));
            },
        },
    ],
    // Generate random timeline variables (pick random images for each numerosity).
    timeline_variables: generateTimelineVars(jsPsych, nb_blocks),
    sample: {
        type: 'custom',
        // Custom sampling function to produce semi-random pattern described in function description.
        fn: function (t) {
            const blocks = t.length / 4;
            let template = [];
            let intermediate = [];
            let new_t = [];
            // Shuffle all indices for timeline variables with same numerosity
            for (let nums = 0; nums < 4; nums++) {
                template = [...Array(blocks).keys()].map((x) => x + nums * blocks);
                intermediate = intermediate.concat(jsPsych.randomization.shuffle(template));
            }
            // Create and append block of four numerosities by picking one of each (shuffled) numerosity groups in template array.
            for (let i = 0; i < blocks; i++) {
                const block = [];
                block.push(intermediate[i], intermediate[i + blocks], intermediate[i + 2 * blocks], intermediate[i + 3 * blocks]);
                // Shuffle order of numerosity in a block and append.
                new_t = new_t.concat(jsPsych.randomization.shuffle(block));
            }
            return new_t;
        },
    },
});
function translateCountable(cntable, lang) {
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
function instructionTexts(cntable, lang) {
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
function generateInstructionPages(cntable, lang, text, example = false) {
    if (example === false) {
        const pages = [];
        for (let page_nb = 1; page_nb < 6; page_nb++) {
            pages.push(text.title +
                `<br><img src='../assets/instruction_media/${cntable}/${lang}/instruction_${page_nb}.png'></img>`);
        }
        return pages;
    }
    else {
        return [
            text.title +
                '<br>' +
                text.example +
                `<br><video muted autoplay loop preload="auto"><source type="video/mp4" src="../assets/instruction_media/${cntable}/example_vid.mp4" ></source></video>`,
        ];
    }
}
//Timeline of instructions shown depending on countable (people/objects)
function instructions(jsPsych, cntable, lang) {
    const text = instructionTexts(cntable, lang);
    return {
        timeline: [
            {
                type: jsPsychinstructions,
                pages: generateInstructionPages(cntable, lang, text),
                button_label_next: text.btn_next,
                button_label_previous: text.btn_previous,
                show_clickable_nav: true,
            },
            {
                type: jsPsychinstructions,
                pages: generateInstructionPages(cntable, lang, text, true),
                button_label_next: text.btn_end,
                button_label_previous: text.btn_previous,
                show_clickable_nav: true,
            },
        ],
    };
}
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run( /*{
  assetPaths,
  input = {},
  environment,
  title,
  version,
}*/) {
    const jsPsych = initJsPsych();
    const timeline = [];
    // Preload assets
    timeline.push({
        type: PreloadPlugin,
        auto_preload: true,
    });
    // Switch to fullscreen
    timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
    });
    // Run numerosity task
    timeline.push(instructions(jsPsych, 'people', 'en'), partofexp(jsPsych, 'people', 'en'), instructions(jsPsych, 'objects', 'en'), partofexp(jsPsych, 'objects', 'en'));
    await jsPsych.run(timeline);
    // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
    // if you handle results yourself, be it here or in `on_finish()`)
    return jsPsych;
}
