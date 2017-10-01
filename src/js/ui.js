window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/**
 * @todo Handle mouse leaving the canvas.
 */

function UIController() {
    this.mouseMoving = false;
    this.lastPosition = null;

    this.project = new Project("Untitled");
    this.viewport = new Viewport($("#viewport"), this.project.dimensions);
    this.project.layerList[0].reset();
    this.viewport.setLayerList(this.project.layerList);
    this.viewport.viewportDimensionsChanged();
}

UIController.prototype.onToolboxClicked = function(event) {
    if (event.target.innerHTML === "brush") {
        this.project.changeTool(getToolByName("TestTool"));
    } else {
        console.warn("Unimplemented tool.");
    }
};

UIController.prototype.onMouseDown = function(event) {
    this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
    this.mouseMoving = true;

    this.project.mouseClick(this.lastPosition);
    window.requestAnimationFrame(this.step.bind(this));
};

UIController.prototype.onMouseUp = function(event) {
    this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
    this.mouseMoving = false;
    this.project.mouseRelease(this.lastPosition);
};

UIController.prototype.onMouseMove = function(event) {
    this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
};


UIController.prototype.step = function(timestamp) {
    if(this.project.mouseMove(this.lastPosition)) {
        this.viewport.renderLayers();
        if (this.mouseMoving) {
            window.requestAnimationFrame(this.step.bind(this));
        }
    }
};

UIController.prototype.windowResized = function (newSize) {
    this.viewport.viewportDimensionsChanged();
};


var controller;

$(document).ready(function() {
    controller = new UIController();

    $("#toolbox-container").children().click(controller.onToolboxClicked.bind(controller));
    $("#viewport").mousedown(controller.onMouseDown.bind(controller));
    $("#viewport").mouseup(controller.onMouseUp.bind(controller));
    $("#viewport").mousemove(controller.onMouseMove.bind(controller));

    $(window).on('resize', (function(e) {
        controller.windowResized(Vec2($(window).width(), $(window).height()));
    }).bind(controller));
});