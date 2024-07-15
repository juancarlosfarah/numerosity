"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
/**
 * @title Numerosity
 * @description Social numerosity task.
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
const plugin_fullscreen_1 = __importDefault(require("@jspsych/plugin-fullscreen"));
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const plugin_preload_1 = __importDefault(require("@jspsych/plugin-preload"));
const jspsych_1 = require("jspsych");
require("../styles/main.scss");
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
function run(_a) {
    return __awaiter(this, arguments, void 0, function* ({ assetPaths, input = {}, environment, title, version, }) {
        const jsPsych = (0, jspsych_1.initJsPsych)();
        const timeline = [];
        // Preload assets
        timeline.push({
            type: plugin_preload_1.default,
            images: assetPaths.images,
            audio: assetPaths.audio,
            video: assetPaths.video,
        });
        // Welcome screen
        timeline.push({
            type: plugin_html_keyboard_response_1.default,
            choices: ['enter'],
            stimulus: '<p>Welcome to Numerosity!<p/>',
        });
        timeline.push({
            type: plugin_html_keyboard_response_1.default,
            choices: ['a'],
            stimulus: '<p>Page 2<p/>',
        });
        timeline.push({
            type: plugin_html_keyboard_response_1.default,
            choices: ['a'],
            stimulus: '<p>Page 3<p/>',
        });
        // Switch to fullscreen
        timeline.push({
            type: plugin_fullscreen_1.default,
            fullscreen_mode: true,
        });
        yield jsPsych.run(timeline);
        // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
        // if you handle results yourself, be it here or in `on_finish()`)
        return jsPsych;
    });
}
