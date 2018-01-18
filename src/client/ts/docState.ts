/**
 *@author {Milan Martos}
 *@brief Project class representing a project. (controller)
 */

import {Layer, LayerInfo} from "./ui/layer";
import {Tool} from "./tools/tool";
import {Vec2} from "./vec2";
import {PixelSelectionHandler} from "./selection/selection";
import {UIController} from "./ui/ui";
import {mask} from "./selection/selectionUtils";
import {PintHistory} from "./history/history";
import * as squareRecon from "./image_utils/squareRecon";
import {ActionInterface, ActionType} from "./tools/actionInterface";
import {NetworkLink} from "./actionLink/networkLink";
import {ToolRegistry} from "./tools/toolregistry";
import {ActionLink} from "./actionLink/actionLink";
import {LocalLink} from "./actionLink/localLink";
import {highlight_layer, setup_layer_menu} from "./ui/layermenu";

/**
 * Project manager.
 */
export class Project {
    name: string;
    dimensions: Vec2;
    previewLayers: Map<string, Layer>;
    currentPreviewLayer: Layer;
    currentLayer: Layer;
    workingLayer: Layer;
    replaceLayer: boolean;

    layerList: Array<Layer>; // The renderer draw layers in order.
    currentTool: Tool;
    currentSelection: PixelSelectionHandler;
    ui: UIController;
    redraw: boolean; // UIcontroller check this.redraw to now if it has to update the drawing
    history: PintHistory;
    toolRegistry: ToolRegistry;
    link: ActionLink;
    private usingTool: boolean;

    /**
     * Instantiates a project.
     *
     * @param {UIController} ui User interface manager
     * @param {string} name Name of the project
     * @param {Vec2} dimensions Dimensions of the picture
     */
    constructor(ui: UIController, name: string, dimensions: Vec2) {
        this.name = name;

        this.toolRegistry = new ToolRegistry();
        if (dimensions == null) {
            this.dimensions = new Vec2(800, 600);
        } else {
            this.dimensions = dimensions;
        }

        this.previewLayers = new Map();
        this.currentLayer = new Layer(this.dimensions);
        this.workingLayer = new Layer(this.dimensions);

        this.layerList = [this.currentLayer]; // The renderer draw layers in order + preview layer position specified by renderPreviewPosition.

        this.currentTool = null;
        this.ui = ui;
        this.redraw = false;
        this.replaceLayer = false;


        /** selection is a table of int between 0 and 255 that represents selected
         * pixels (initialized with number of pixels of current layer)
         * @todo : standardize selection dimension - layers ...
         */
        this.currentSelection = new PixelSelectionHandler(this.dimensions.x, this.dimensions.y);
        this.currentLayer.fill();

        this.link = new LocalLink(this);
    }


    enableNetwork(socket: SocketIOClient.Socket) {
        this.link = new NetworkLink(this, socket);
    }

    /**
     * Current tool getter.
     * @returns {Tool} Current tool used in the project.
     */
    getCurrentTool(): Tool {
        return this.currentTool;
    }

    /**
     * User interface handler getter.
     * @returns {UIController} The user interface handler.
     */
    getUI(): UIController {
        return this.ui;
    }

    /**
     * Update current tool.
     * @param {Tool} tool Tool to use.
     */
    changeTool(tool: Tool) {
        this.currentTool = tool;
    };

    /**
     * Mouse click handler, transfers the event to the current tool, if one is selected.
     * @param {Vec2} vect Local coordinates in the drawing canvas.
     */
    mouseClick(vect: Vec2) {
        if (this.currentTool !== null) {
            this.usingTool = true;

            let img = this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y);
            if (!this.currentTool.overrideSelectionMask) {
                img = mask(this.currentSelection.getValues(), img);
            }

            this.currentTool.startUse(img, vect);
        }
    };

    /**
     * Mouse move handler, called after a mouseClick and before a mouseRelease. Updates pre-rendering and transfers the
     * event to the selected tool, if there's one. Asks the renderer to redraw.
     * @param {Vec2} vect Local coordinates in the drawing canvas.
     * @returns true if the function updated one of the layers, else returns false.
     */
    mouseMove(vect: Vec2) {
        if (this.currentTool !== null && this.usingTool === true) {
            this.currentTool.continueUse(vect);

            let action = {
                toolName: this.currentTool.getName(),
                actionData: this.currentTool.getData(),
                type: ActionType.ToolPreview,
                toolSettings: this.currentTool.getSettings().exportParameters(),
            };

            action.toolSettings["layer"] = this.layerList.indexOf(this.currentLayer); // Encapsulate layer information.

            this.setPreviewLayer("localhost");
            this.applyAction(action, this.currentSelection, false);

            if (this.currentTool.getSettings().canBeSentOverNetwork() === true) {
                this.link.sendAction(action);
            }
        }

        return true;
    };

    /**
     * Mouse release handler. Event transmitted to the tool one last time (if one is selected). Then updates the drawing
     * canvas according to what has been done to the pre-rendering canvas (on which the tool could work).
     * Then clears the pre-rendering canvas and ask the renderer to redraw.
     * @param {Vec2} vect coordinates in the canvas
     */
    mouseRelease(vect: Vec2) {
        if (this.currentTool !== null && this.usingTool === true) {
            this.usingTool = false;
            /// TODO: Work on it.
            this.currentTool.endUse(vect);

            let action = {
                toolName: this.currentTool.getName(),
                actionData: this.currentTool.getData(),
                type: ActionType.ToolApply,
                toolSettings: this.currentTool.getSettings().exportParameters(),
            };

            action.toolSettings["layer"] = this.layerList.indexOf(this.currentLayer);

            if (this.currentTool.getSettings().canBeSentOverNetwork() === false) {
                this.applyAction(action, this.currentSelection, false);
            } else {
                this.link.sendAction(action);
            }

        }
    };

    /**
     * Undo last action.
     */
    undo() {
        let action = {
            toolName: "Undo",
            actionData: "",
            type: ActionType.Undo,
            toolSettings: {}
        };
        this.link.sendAction(action);
    }

    /**
     * Redo last action.
     */
    redo() {
        let action = {
            toolName: "Redo",
            actionData: "",
            type: ActionType.Redo,
            toolSettings: {}
        };
        this.link.sendAction(action);
    }

    /**
     * Apply action to the document.
     * If generateHistory is set to true and the action is a tool application,
     * promises a non-null ActionInterface to cancel last action.
     * @param {ActionInterface} action
     * @param {PixelSelectionHandler} selectionHandler
     * @param {boolean} generateHistory
     * @returns {Promise<ActionInterface>}
     */
    async applyAction(action: ActionInterface, selectionHandler: PixelSelectionHandler, generateHistory: boolean): Promise<ActionInterface> {
        switch (action.type) {
            case ActionType.ToolApply: {
                this.replaceLayer = false;
                /*
                 * GET TOOL AND SET TOOL STATE.
                 */
                let tool = this.toolRegistry.getToolByName(action.toolName);
                tool.reset();
                tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
                tool.updateData(action.actionData);

                /*
                 * RESET
                 */
                this.currentPreviewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);

                let draw_layer = action.toolSettings["layer"];
                console.log("Action on layer: " + draw_layer);

                if (!tool.overrideSelectionMask) { /// Applying selection mask.
                    let history_save = "";
                    if (generateHistory) { // Backup layer content
                        history_save = this.layerList[draw_layer].getHTMLElement().toDataURL();
                    }

                    if (tool.readahead) { // The tool can see what is in the layer on application.
                        this.currentPreviewLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                        this.layerList[draw_layer].applyInvMask(selectionHandler);
                    }

                    /*
                     * Apply tool and generate undo if needed.
                     */
                    let undo = await tool.applyTool(this.currentPreviewLayer, generateHistory);
                    if (undo != null && undo.type == ActionType.ToolApplyHistory) {

                        undo.type = ActionType.ToolApply;
                        undo.toolName = "PasteTool";
                        undo.toolSettings = {
                            project_clipboard: history_save,
                            project_clipboard_x: 0,
                            project_clipboard_y: 0,
                            layer: draw_layer,
                            mode: "copy"
                        };
                        undo.actionData = {x: 0, y: 0};
                    }


                    this.currentPreviewLayer.applyMask(selectionHandler);
                    this.layerList[draw_layer].getContext().drawImage(this.currentPreviewLayer.getHTMLElement(), 0, 0);

                    this.currentPreviewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                    this.redraw = true;
                    return undo;
                } else { /// Or not.
                    let undo = await tool.applyTool(this.layerList[draw_layer], generateHistory);

                    this.currentPreviewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                    this.redraw = true;
                    return undo;
                }
            }

            case ActionType.ToolPreview: {
                if (this.ui == null) {
                    return null; // No work on server side for preview.
                }

                let tool = this.toolRegistry.getToolByName(action.toolName);
                tool.reset();
                tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
                tool.updateData(action.actionData);

                this.currentPreviewLayer.reset();
                if (tool.readahead) {
                    // The tool can see what is in the layer on application.
                    let draw_layer = action.toolSettings["layer"];
                    this.currentPreviewLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                    this.workingLayer.reset();
                    this.workingLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);

                    this.replaceLayer = true;
                } else {
                    this.replaceLayer = false;
                }
                tool.drawPreview(this.currentPreviewLayer);

                if (!tool.overrideSelectionMask) {
                    // Optimized masking according to what is displayed.
                    this.ui.viewport.applyMask(this.currentPreviewLayer, selectionHandler);
                    this.ui.viewport.applyInvMask(this.workingLayer, selectionHandler);

                    this.currentPreviewLayer.getContext().drawImage(this.workingLayer.getHTMLElement(), 0, 0);
                }

                this.redraw = true;
                return null;
            }

            case ActionType.DeleteLayer: {
                let i = action.actionData;
                let indexNewCurrentLayer;

                for (let j = 0; j < this.layerList.length; j++) {
                    if (this.currentLayer == this.layerList[j]) {
                        if (i < j) { // if deleted layer is before selected layer, we have to decrease by 1
                            indexNewCurrentLayer = j - 1;
                        }
                        else {
                            indexNewCurrentLayer = j;
                        }
                    }
                }

                let backupContent: string;

                if (i >= this.layerList.length || i < 0) {
                    throw "try to delete a layer that doesn't exist";
                }
                else if (this.layerList.length == 1) {
                    console.warn("impossible to delete the only layer remaining");
                }
                else if (this.currentLayer == this.layerList[i]) {
                    backupContent = this.layerList[i].getHTMLElement().toDataURL();
                    if (i == this.layerList.length - 1) { // if layer i is the last layer
                        indexNewCurrentLayer = i - 1;
                        this.selectLayer(indexNewCurrentLayer);
                    }
                    else {
                        this.selectLayer(i + 1);
                        indexNewCurrentLayer = i;
                    }
                    // delete layer i:
                    this.layerList.splice(i, 1);

                }
                else {
                    backupContent = this.layerList[i].getHTMLElement().toDataURL();
                    // delete layer i:
                    this.layerList.splice(i, 1);
                }

                if (this.ui != null) {
                    // update the layer manager menu:
                    this.ui.layer_menu_controller = setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                    // update of layer menu display:
                    highlight_layer(this.ui, indexNewCurrentLayer);
                }

                return {
                    toolName: "AddLayer",
                    actionData: {
                        position: i,
                        content: backupContent
                    },
                    type: ActionType.AddLayer,
                    toolSettings: {}
                };
            }

            case ActionType.AddLayer: {
                let l = new Layer(this.dimensions); // added layer
                l.reset(); // set added layer transparent
                // add the newly created Layer to layerList, just before position indexed by n_last_layer+1:
                this.layerList.splice(action.actionData.position, 0, l);
                this.currentLayer = l;

                if (action.actionData.content != "") {
                    await l.drawDataUrl(action.actionData.content, 0, 0);
                }

                if (this.ui != null) {
                    this.ui.layer_menu_controller = setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                    highlight_layer(this.ui, action.actionData.position);
                }

                return {
                    toolName: "DeleteLayer",
                    actionData: action.actionData.position,
                    type: ActionType.DeleteLayer,
                    toolSettings: {}
                };
            }

            case ActionType.UpdateLayerInfo: {
                let prevInfo = this.layerList[action.actionData.position].layerInfo.data();
                this.layerList[action.actionData.position].layerInfo = new LayerInfo();
                this.layerList[action.actionData.position].layerInfo.copyFrom(action.actionData.content);
                if (this.ui != null) {
                    this.ui.layer_menu_controller = setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                    highlight_layer(this.ui, this.layerList.indexOf(this.currentLayer));
                }

                return {
                    toolName: "UpdateLayerInfo",
                    actionData: {
                        position: action.actionData.position,
                        content: prevInfo,
                    },
                    type: ActionType.UpdateLayerInfo,
                    toolSettings: {}
                };
            }

            case ActionType.ExchangeLayers: {
                var temp = this.layerList[action.actionData.positionA];
                this.layerList[action.actionData.positionA] = this.layerList[action.actionData.positionB];
                this.layerList[action.actionData.positionB] = temp;
                if (this.ui != null) {
                    this.ui.layer_menu_controller = setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                    highlight_layer(this.ui, this.layerList.indexOf(this.currentLayer));
                }

                return action;
            }
        }
    }

    /**
     * Tells whether the selection layer should be redrawn.
     * @returns {boolean} true if a redraw is needed, else false.
     */
    renderSelection(): boolean {
        if (this.currentSelection.getBorder().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Getter for layerList (for layerManager)
     */
    getLayerList(): Array<Layer> {
        return this.layerList
    };

    /**
     * Add a Layer in the layerList, just before the currentPreviewLayer and the selectionLayer
     */
    addLayer() {
        let action = {
            toolName: "AddLayer",
            actionData: {
                position: this.layerList.length,
                content: ""
            },
            type: ActionType.AddLayer,
            toolSettings: {}
        };
        this.link.sendAction(action);
    };

    /**
     * Set layer of index i as the current layer
     * @param {number} i
     */
    selectLayer(i: number) {
        if (i >= this.layerList.length || i < 0) {
            throw "try to select a layer that doesn't exist"
                ;
        }
        else {
            this.currentLayer = this.layerList[i];
        }
    };

    /**
     * Delete layer of index i
     * @param {number} i
     */
    deleteLayer(i: number) {
        let action = {
            toolName: "DeleteLayer",
            actionData: i,
            type: ActionType.DeleteLayer,
            toolSettings: {}
        };
        this.link.sendAction(action);
    };

    updateLayerInfo(layer: Layer, layerInfo: LayerInfo) {
        let action = {
            toolName: "UpdateLayerInfo",
            actionData: {
                position: this.layerList.indexOf(layer),
                content: layerInfo.data(),
            },
            type: ActionType.UpdateLayerInfo,
            toolSettings: {}
        };
        this.link.sendAction(action);
    }

    /**
     * Switch two Layers
     * @param {number} i First layer to switch, index starting from 0
     * @param {number} j Second layer to switch, index starting from 0
     */
    exchangeLayers(i: number, j: number) {
        let action = {
            toolName: "ExchangeLayers",
            actionData: {
                positionA: i,
                positionB: j,
            },
            type: ActionType.ExchangeLayers,
            toolSettings: {}
        };
        this.link.sendAction(action);
    };

    /**
     * Saves the current project as a download of the resulting image
     * for the user
     */
    saveProject() {
        this.workingLayer.reset();
        for (let i = 0; i < this.layerList.length; i++) {
            this.workingLayer.getContext().drawImage(this.layerList[i].getHTMLElement(), 0, 0);
        }

        let content = this.workingLayer.getHTMLElement()
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        let fake_link = document.createElement('a');
        fake_link.download = this.name + '.png';
        fake_link.href = content;
        document.body.appendChild(fake_link);
        fake_link.click();
        document.body.removeChild(fake_link);
    }

    testSquare(elem: HTMLElement) {
        let color: string;
        if (squareRecon.hasSquare(this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y))) {
            color = "#6aeb70";
        } else {
            color = "#cc3058";
        }
        elem.setAttribute("style", "color: " + color);
    }

    /**
     * Update current preview layer to specified id.
     * @param {string} sender
     */
    setPreviewLayer(sender: string) {
        if (this.previewLayers.get(sender) == undefined) {
            this.previewLayers.set(sender, new Layer(this.dimensions));
            console.log("Created a new layer for " + sender);
        }

        this.currentPreviewLayer = this.previewLayers.get(sender);
    }
}
