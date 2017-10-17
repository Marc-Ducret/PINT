import * as $ from "jquery";
import {UIController} from "./ts/ui";
import {Vec2} from "./ts/vec2";

/**
 * @description Binds HTML events to UIController's handlers.
 */

export var controller = new UIController();
console.log("Setting up UI");

$("#toolbox-container").children().click(controller.onToolboxClicked.bind(controller));
$("#viewport").mousedown(controller.onMouseDown.bind(controller));
$("#viewport").mouseup(controller.onMouseUp.bind(controller));
$("#viewport").mousemove(controller.onMouseMove.bind(controller));

$(window).on('resize', (function(e) {
    controller.onWindowResize(new Vec2($(window).width(), $(window).height()));
}).bind(controller));

controller.onWindowResize(new Vec2($(window).width(), $(window).height()));

document["controller"] = controller;
