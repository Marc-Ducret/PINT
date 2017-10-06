/**
 * @file User interface handler
 * @description Catches HTML browser events (essentially mouse input) and acts as an intermediary
 * between the project manager and the on-canvas renderer.
 */


// Cross-browser compatibility for requestAnimationFrame function, which allows to set callbacks
// for canvas painting.
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/**
 * @classdesc This class consists essentially in handling HTML events for the project manager and link
 * it with the on-canvas renderer.
 * @class UIController
 * @description Creates a new Project, a new Viewport and link both components for rendering.
 */
function UIController() {
    this.mouseMoving = false;
    this.lastPosition = null;

    this.project = new Project("Untitled");
    this.viewport = new Viewport($("#viewport"), this.project.dimensions);

    this.viewport.setLayerList(this.project.layerList);
    this.viewport.viewportDimensionsChanged();
}

/**
 * @function onToolboxClicked
 * @description Event handler triggered when one of the toolbox buttons is clicked.
 * @param event Event object (see JQuery documentation).
 * @this UIController
 * @memberOf UIController
 */
UIController.prototype.onToolboxClicked = function(event) {
    var action = event.target.innerHTML;
    var toolname = event.target.getAttribute("data-tool");
    if(toolname !== null) {
        var tool = getToolByName(toolname);
        if(tool !== null) {
            this.project.changeTool(tool);
        } else {
            console.warn("No such tool "+toolname);
        }
    } else {
        var func = event.target.getAttribute("data-function");
        if(func !== null) {
            eval(func);
        } else {
            console.warn("Unimplemented tool.");
        }
    }
};

/**
 * @function onMouseDown
 * @description Event handler triggered on mouse down.
 * @param event Event object (see JQuery documentation).
 * @this UIController
 * @memberOf UIController
 */
UIController.prototype.onMouseDown = function(event) {
    this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
    this.mouseMoving = true;

    this.project.mouseClick(this.lastPosition);
    window.requestAnimationFrame(this.onStep.bind(this));
};

/**
 * @function onMouseUp
 * @description Event handler triggered on mouse up.
 * @param event Event object (see JQuery documentation).
 * @this UIController
 */
UIController.prototype.onMouseUp = function(event) {
    this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
    this.mouseMoving = false;
    this.project.mouseRelease(this.lastPosition);
};

/**
 * @function onMouseMove
 * @description Event handler triggered on mouse move.
 * @param event Event object (see JQuery documentation).
 * @memberOf UIController
 * @this UIController
 */
UIController.prototype.onMouseMove = function(event) {
    this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
};

/**
 * @function onStep
 * @description Handles a paint step by transmitting the position of the mouse to the project handler, and then rendering the document.
 * @param timestamp Time when the event was triggered.
 * @this UIController
 * @memberOf UIController
 */
UIController.prototype.onStep = function(timestamp) {
    if(this.project.mouseMove(this.lastPosition)) {
        this.viewport.renderLayers();
        if (this.mouseMoving) {
            window.requestAnimationFrame(this.onStep.bind(this));
        }
    }
};

/**
 * @function onWindowResize
 * @description Catches the resize event and transmits it to the on-canvas renderer.
 * @param newSize Vec2 containing the new size of the window.
 * @this UIController
 * @memberOf UIController
 */
UIController.prototype.onWindowResize = function (newSize) {
    this.viewport.viewportDimensionsChanged();
};


var controller;

/**
 * @description Binds HTML events to UIController's handlers.
 */
$(document).ready(function() {
    controller = new UIController();

    $("#toolbox-container").children().click(controller.onToolboxClicked.bind(controller));
    $("#viewport").mousedown(controller.onMouseDown.bind(controller));
    $("#viewport").mouseup(controller.onMouseUp.bind(controller));
    $("#viewport").mousemove(controller.onMouseMove.bind(controller));

    $(window).on('resize', (function(e) {
        controller.onWindowResize(Vec2($(window).width(), $(window).height()));
    }).bind(controller));
});
