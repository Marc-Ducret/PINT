import * as $ from "jquery";
import {UIController} from "./ts/ui/ui";

/**
 * @description Binds HTML events to UIController's handlers.
 */

export let controller = new UIController();
console.log("Setting up UI");

controller.bindEvents(
    $("#toolbox-container"),
    $("#viewport"),
    $("#newproject_button"),
    $("#newproject_width"),
    $("#newproject_height"));

document["controller"] = controller;


