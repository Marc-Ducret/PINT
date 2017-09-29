window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/**
 * @todo Handle mouse leaving the canvas.
 */

function UIController() {
    var self = this;
    this.mouseMoving = false;
    this.lastPosition = null;

    this.project = new Project("Untitled");

    this.onToolboxClicked = function() {
        if (this.innerHTML === "brush") {
            self.project.changeTool(getToolByName("TestTool"));
        } else {
            console.warn("Unimplemented tool.");
        }
    };

    this.onMouseDown = function(event) {
        self.lastPosition = new Vec2(event.offsetX, event.offsetY);
        self.mouseMoving = true;

        self.project.mouseClick(self.lastPosition);
        window.requestAnimationFrame(self.step);
    };

    this.onMouseUp = function(event) {
        self.lastPosition = new Vec2(event.offsetX, event.offsetY);
        self.mouseMoving = false;
        self.project.mouseRelease(self.lastPosition);
    };

    this.onMouseMove = function(event) {
        self.lastPosition = new Vec2(event.offsetX, event.offsetY);
    };


    this.step = function(timestamp) {
        self.project.mouseMove(self.lastPosition);
        if (self.mouseMoving) {
            window.requestAnimationFrame(self.step);
        }
    }




}


var controller;

$(document).ready(function() {
    controller = new UIController();

    $("#toolbox-container").children().click(controller.onToolboxClicked);
    $("#base").mousedown(controller.onMouseDown);
    $("#base").mouseup(controller.onMouseUp);
    $("#base").mousemove(controller.onMouseMove);
});