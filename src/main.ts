import * as $ from "jquery";
import {UIController} from "./ts/ui";
import {Vec2} from "./ts/vec2";

/**
 * @description Binds HTML events to UIController's handlers.
 */

export let controller = new UIController();
console.log("Setting up UI");

let toolbox_container = $("#toolbox-container");
let viewport = $("#viewport");
let newproject_button = $("#newproject_button");
let width_input = $("#newproject_width");
let height_input = $("#newproject_height");

toolbox_container.children().click(controller.onToolboxClicked.bind(controller));
viewport.mousedown(controller.onMouseDown.bind(controller));
viewport.mouseup(controller.onMouseUp.bind(controller));
viewport.mousemove(controller.onMouseMove.bind(controller));
document.getElementById("viewport").addEventListener('wheel', controller.onMouseWheel.bind(controller));

newproject_button.click(function() {
    controller.newProject(new Vec2(<number> width_input.val(), <number> height_input.val()));
});

$(window).on('resize', (function(e) {
    controller.onWindowResize(new Vec2($(window).width(), $(window).height()));
}).bind(controller));

controller.onWindowResize(new Vec2($(window).width(), $(window).height()));

document["controller"] = controller;
