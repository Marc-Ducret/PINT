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

toolbox_container.children().click(controller.onToolboxClicked.bind(controller));
viewport.mousedown(controller.onMouseDown.bind(controller));
viewport.mouseup(controller.onMouseUp.bind(controller));
viewport.mousemove(controller.onMouseMove.bind(controller));
window.addEventListener('wheel', controller.onMouseWheel.bind(controller));

$(window).on('resize', (function(e) {
    controller.onWindowResize(new Vec2($(window).width(), $(window).height()));
}).bind(controller));

controller.onWindowResize(new Vec2($(window).width(), $(window).height()));

document["controller"] = controller;
