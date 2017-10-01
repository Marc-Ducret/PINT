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
    this.viewport = new Viewport($("#viewport"), this.project.dimensions);
    this.project.layerList[0].reset();
    this.viewport.setLayerList(this.project.layerList);
    this.viewport.viewportDimensionsChanged();

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
        if(self.project.mouseMove(self.lastPosition)) {
            self.viewport.renderLayers();
            if (self.mouseMoving) {
                window.requestAnimationFrame(self.step);
            }
        }
    }

    this.windowResized = function (newSize) {
        self.viewport.viewportDimensionsChanged();
    }


}


var controller;

$(document).ready(function() {
    controller = new UIController();

    $("#toolbox-container").children().click(controller.onToolboxClicked);
    $("#viewport").mousedown(controller.onMouseDown);
    $("#viewport").mouseup(controller.onMouseUp);
    $("#viewport").mousemove(controller.onMouseMove);

    $(window).on('resize', function(e) {
        console.log("Window resized: " + $(this).width() + "x" + $(this).height());
        controller.windowResized(Vec2($(this).width(), $(this).height()));
    });
});