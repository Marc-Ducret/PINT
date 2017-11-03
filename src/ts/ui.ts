import * as $ from "jquery";

import {Project} from "./docState";
import {SettingsInterface} from "./tool_settings/settingsInterface";
import {Viewport} from "./viewport";
import {ToolRegistry} from "./tools/toolregistry";
import {Vec2} from "./vec2";

/**
 * @file User interface handler
 * @description Catches HTML browser events (essentially mouse input) and acts as an intermediary
 * between the project manager and the on-canvas renderer.
 */

/**
 * @classdesc This class consists essentially in handling HTML events for the project manager and link
 * it with the on-canvas renderer.
 * @class UIController
 * @description Creates a new Project, a new Viewport and link both components for rendering.
 */
export class UIController {
    mouseMoving: boolean = false;
    lastPosition: Vec2 = null;
    project: Project;
    viewport: Viewport;
    settingsUI: SettingsInterface;
    toolRegistry: ToolRegistry;
    redraw: boolean;

    constructor (){
        this.project = new Project(this, "Untitled");
        this.viewport = new Viewport(<JQuery<HTMLCanvasElement>> $("#viewport"), this.project.dimensions);

        this.viewport.setLayerList(this.project.layerList);
        this.viewport.viewportDimensionsChanged();

        this.settingsUI = new SettingsInterface(<JQuery<HTMLElement>> $("#toolsettings_container"));
        this.toolRegistry = new ToolRegistry();

        this.redraw = true;
        window.requestAnimationFrame(this.onStep.bind(this));
    }

    /**
     * @function onToolboxClicked
     * @description Event handler triggered when one of the toolbox buttons is clicked.
     * @param event Event object (see JQuery documentation).
     * @this UIController
     * @memberOf UIController
     */
    onToolboxClicked (event: Event) {

        var toolname = (<Element> event.target).getAttribute("data-tool");
        if(toolname !== null) {
            var tool = this.toolRegistry.getToolByName(toolname);
            if(tool !== null) {
                this.settingsUI.setupToolSettings(tool);
                this.project.changeTool(tool);
            } else {
                console.warn("No such tool "+toolname);
            }
        } else {
            var func = (<Element> event.target).getAttribute("data-function");
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
    onMouseDown (event: MouseEvent) {
        this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
        this.mouseMoving = true;

        this.project.mouseClick(this.lastPosition);
    };

    /**
     * @function onMouseUp
     * @description Event handler triggered on mouse up.
     * @param event Event object (see JQuery documentation).
     * @this UIController
     */
    onMouseUp (event: MouseEvent) {
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
    onMouseMove (event: MouseEvent) {
        this.lastPosition = this.viewport.globalToLocalPosition(new Vec2(event.offsetX, event.offsetY));
    };


    onMouseWheel (event: WheelEvent) {
        this.zoom(event.deltaY);
    };

    zoom (value: number) {
        this.viewport.setScale(this.viewport.getScale()*Math.pow(1.001, value));
        this.redraw = true;
    }

    translate (translation: Vec2) {
        let realTranslation = this.viewport.getTranslation().add(translation.divide(this.viewport.getScale(),true), true);
        this.viewport.setTranslation(realTranslation);
        this.redraw = true;
    }


    /**
     * @function onStep
     * @description Handles a paint step by transmitting the position of the mouse to the project handler, and then rendering the document.
     * @param timestamp Time when the event was triggered.
     * @this UIController
     * @memberOf UIController
     */
    onStep (timestamp: number) {
        if (this.mouseMoving && this.project.mouseMove(this.lastPosition)) {
            this.redraw = true;
        }

        if (this.project.renderSelection()) {
            this.redraw = true;
        }

        if (this.project.redraw) {
            this.redraw = true;
        }

        if (this.redraw) {
            this.viewport.renderLayers();
        }
        this.redraw = false;
        window.requestAnimationFrame(this.onStep.bind(this));
    };

    /**
     * @function onWindowResize
     * @description Catches the resize event and transmits it to the on-canvas renderer.
     * @param newSize Vec2 containing the new size of the window.
     * @this UIController
     * @memberOf UIController
     */
    onWindowResize (newSize: Vec2) {
        var offset = $("#viewport").offset();
        $("#viewport").height(newSize.y - offset.top);
        this.viewport.viewportDimensionsChanged();
    };

}


