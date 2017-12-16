import * as $ from "jquery";

import {Project} from "../docState";
import {SettingsInterface} from "../tool_settings/settingsInterface";
import {Viewport} from "./viewport";
import {ToolRegistry} from "../tools/toolregistry";
import {Vec2} from "../vec2";
import {MenuController, setup_menu} from "./menu";
import * as io from 'socket.io-client';
import {LayerMenuController, setup_layer_menu} from "./layermenu"

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
    layer_menu_controller: LayerMenuController;
    toolRegistry: ToolRegistry;
    menu_controller: MenuController;
    redraw: boolean;

    project_name: string;
    socket: SocketIOClient.Socket;

    constructor (){
        this.socket = io.connect('//');

        let fallbackImage = document.createElement("img");
        this.viewport = new Viewport(<JQuery<HTMLCanvasElement>> $("#viewport"), fallbackImage);
        fallbackImage.addEventListener("load", function() {
            this.viewport.viewportDimensionsChanged();
        }.bind(this));
        fallbackImage.src= "assets/"+(1+Math.floor(Math.random()*10))+".png";

        this.settingsUI = new SettingsInterface(<JQuery<HTMLElement>> $("#toolsettings_container"));
        this.toolRegistry = new ToolRegistry();

        this.menu_controller = setup_menu(this, document.getElementById("top-nav"));

        this.project_name = "Untitled";
        this.redraw = true;

        // On connect, allow load from server.
        this.socket.on("connect", function() {
            this.loadServerHosted("main");
        }.bind(this));

        this.socket.on("joined", this.loadServerHostedCallback.bind(this));

        window.requestAnimationFrame(this.onStep.bind(this));
    }

    filenameUpdate (new_title: string) {
        if (this.project != null) {
            this.project.name = new_title;
        }
        this.project_name = new_title;
    }

    loadImageFromFile() {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".jpg, .jpeg, .png";
        input.setAttribute("style", "display:none");
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

        document.body.appendChild(input);
        input.click();
        return false;
    }


    loadServerHosted (name: string) {
        this.socket.emit('join', name);
    }


    /// Data contains project dimensions, image data
    loadServerHostedCallback (data) {
        this.newProject(data.dimensions);

        /// TODO: Work with multiple layers.
        let img = new Image;
        img.onload = function(){
            this.project.currentLayer.getContext().drawImage(img,0,0);
        }.bind(this);
        img.src = data.data;
    }


    newProject (dimensions: Vec2) {
        this.menu_controller.switchCategory(1);

        this.redraw = true;
        this.project = new Project(this, this.project_name, dimensions);
        this.viewport.setLayerList(this.project.layerList);
        $("#toolbox-container").children().removeClass("hovered"); // Unselect tools.

        // display the layer menu:
        this.layer_menu_controller = setup_layer_menu(this, document.getElementById("layerManager_container"));

    }

    /**
     * @brief: add a layer to the project (in ending position)
     */
    addLayer () {
        // add a layer to the current project:
        this.project.addLayer();
        // update the layer manager menu:
        this.layer_menu_controller = setup_layer_menu(this, document.getElementById("layerManager_container"));
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

        let zoom_scale = 1;
        if (event.deltaMode == 1) {
            zoom_scale *= 17;
        }

        let oldScale = this.viewport.getScale();
        this.zoom(event.deltaY*zoom_scale);
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
     * @TODO : add layer_container argument wherever bindEvents is called
     */
    bindEvents (/*layer_container, */toolbox_container, viewport, newproject_button, newproject_width, newproject_height) {
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


