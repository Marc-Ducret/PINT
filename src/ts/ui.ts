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
    project: Project = null;
    viewport: Viewport;
    settingsUI: SettingsInterface;
    toolRegistry: ToolRegistry;
    redraw: boolean;
    menu_open: boolean;

    constructor (){
        this.viewport = new Viewport(<JQuery<HTMLCanvasElement>> $("#viewport"));
        this.viewport.viewportDimensionsChanged();

        this.settingsUI = new SettingsInterface(<JQuery<HTMLElement>> $("#toolsettings_container"));
        this.toolRegistry = new ToolRegistry();

        this.menu_open = true;
        this.redraw = true;
        window.requestAnimationFrame(this.onStep.bind(this));
    }

    homeClicked () {
        if (!this.menu_open) {
            $("#toolbox_col").fadeOut(100);
            $("#filename-container").fadeOut(100, function() {
                $("#load_image_file_col").fadeIn(100);
                $("#load_image_url_col").fadeIn(100);
                $("#newproject_container").fadeIn(100);
                $("#back_col").fadeIn(100);
            });
            this.menu_open = true;
        }
    }

    loadImageFromFile() {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".jpg, .jpeg, .png";

        let self = this;

        input.addEventListener("change", function(event: any) {
            let selectedFile: File = event.target.files[0];
            let reader = new FileReader();
            let imgtag = document.createElement("img");

            reader.onload = function(event) {
                imgtag.src = reader.result;
                imgtag.addEventListener("load", function() {
                    self.newProject(new Vec2(imgtag.width, imgtag.height));
                    self.project.currentLayer.getContext().drawImage(imgtag, 0, 0);
                });
            };
            reader.readAsDataURL(selectedFile);
        });

        input.click();
        return false;
    }

    backClicked () {
        if (this.menu_open) {
            $("#back_col").fadeOut(100);
            $("#load_image_url_col").fadeOut(100);
            $("#load_image_file_col").fadeOut(100);
            $("#newproject_container").fadeOut(100, function() {
                $("#toolbox_col").fadeIn(100);
                $("#filename-container").fadeIn(100);
            });
            this.menu_open = false;
        }
    }

    newProject (dimensions: Vec2) {
        this.redraw = true;
        this.project = new Project(this, "Untitled", dimensions);
        this.viewport.setLayerList(this.project.layerList);

        this.backClicked();

        this.menu_open = false;
    }

    /**
     * @function onToolboxClicked
     * @description Event handler triggered when one of the toolbox buttons is clicked.
     * @param event Event object (see JQuery documentation).
     * @this UIController
     * @memberOf UIController
     */
    onToolboxClicked (event: Event) {

        let toolname = (<Element> event.target).getAttribute("data-tool");
        if(toolname !== null) {
            let tool = this.toolRegistry.getToolByName(toolname);
            if(tool !== null) {
                if (this.project != null) {
                    this.project.changeTool(tool);
                    this.settingsUI.setupToolSettings(tool);
                    $("#toolbox-container").children().removeClass("hovered");
                    (<Element> event.target).className += " hovered";
                }
            } else {
                console.warn("No such tool "+toolname);
            }
        } else {
            let func = (<Element> event.target).getAttribute("data-function");
            if(func !== null) {
                eval(func);
            } else {
                console.warn("Unimplemented tool.");
            }
        }
    };

    static displayName(name: string) {
        $("#name_container").html(name);
    }

    onToolboxHovered (event: Event) {
        let toolname = (<Element> event.target).getAttribute("data-tool");
        if(toolname !== null) {
            let tool = this.toolRegistry.getToolByName(toolname);
            UIController.displayName(tool.getDesc());
        } else {
            let desc = (<Element> event.target).getAttribute("data-desc");
            UIController.displayName(desc);
        }
    }

    onToolboxHoverLeft (event: Event) {
        if (this.project == null) {
            UIController.displayName("");
            return;
        }

        let tool = this.project.getCurrentTool();
        if (tool != null) {
            UIController.displayName(tool.getDesc());
        } else {
            UIController.displayName("");
        }
    }

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

        if (this.project != null) {
            this.project.mouseClick(this.lastPosition.floor());
        }
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
        if (this.project != null) {
            this.project.mouseRelease(this.lastPosition.floor());
        }
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
        if (this.mouseMoving && this.project != null) {
            this.project.mouseMove(this.lastPosition.floor());
        }
        this.redraw = true;
    };


    onMouseWheel (event: WheelEvent) {
        // offset from the center.
        let ofsX = this.viewport.viewportDimensions.x/2 - event.offsetX;
        let ofsY = this.viewport.viewportDimensions.y/2 - event.offsetY;

        let oldScale = this.viewport.getScale();
        this.zoom(event.deltaY);
        let newScale = this.viewport.getScale();

        let deltaX = -ofsX*(oldScale-newScale)/oldScale;
        let deltaY = -ofsY*(oldScale-newScale)/oldScale;
        this.translate(new Vec2(deltaX, deltaY));
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
        if (this.project != null) {
            if (this.project.renderSelection()) {
                this.redraw = true;
            }

            if (this.project.redraw) {
                this.redraw = true;
            }
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


    /**
     * Given the UI DOM elements as an input, bind events to the controller.
     */
    bindEvents (toolbox_container, viewport, newproject_button, newproject_width, newproject_height) {
        toolbox_container.children().click(this.onToolboxClicked.bind(this));
        toolbox_container.children().hover(this.onToolboxHovered.bind(this),
            this.onToolboxHoverLeft.bind(this));
        viewport.mousedown(this.onMouseDown.bind(this));
        viewport.mouseup(this.onMouseUp.bind(this));
        viewport.mousemove(this.onMouseMove.bind(this));
        viewport.mouseleave(this.onMouseUp.bind(this));
        document.getElementById("viewport").addEventListener('wheel', this.onMouseWheel.bind(this));

        newproject_button.click(function() {
            this.newProject(new Vec2(<number> newproject_width.val(), <number> newproject_height.val()));
        }.bind(this));

        $(window).on('resize', (function(e) {
            this.onWindowResize(new Vec2($(window).width(), $(window).height()));
        }).bind(this));

        this.onWindowResize(new Vec2($(window).width(), $(window).height()));

    }
}


