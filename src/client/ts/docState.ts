/**
 *@author {Milan Martos}
 *@brief Project class representing a project. (controller)
 */

import {Layer} from "./ui/layer";
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
    previewLayer: Layer;
    currentLayer: Layer;
    workingLayer: Layer;

    renderPreviewPosition: number;

    layerList: Array<Layer>; // The renderer draw layers in order.
    currentTool: Tool;
    currentSelection: PixelSelectionHandler;
    ui: UIController;
    redraw: boolean; // UIcontroller check this.redraw to now if it has to update the drawing
    history: PintHistory;
    toolRegistry: ToolRegistry;
    private link: ActionLink;
    private usingTool: boolean;

    /**
     * Instantiates a project.
     *
     * @param {UIController} ui User interface manager
     * @param {string} name Name of the project
     * @param {Vec2} dimensions Dimensions of the picture
     */
    constructor (ui: UIController, name: string, dimensions: Vec2) {
        this.name = name;

        this.toolRegistry = new ToolRegistry();
        if (dimensions == null) {
            this.dimensions = new Vec2(800,600);
        } else {
            this.dimensions = dimensions;
        }

        this.previewLayer = new Layer(this.dimensions);
        this.currentLayer = new Layer(this.dimensions);
        this.workingLayer = new Layer(this.dimensions);
        this.workingLayer.getContext().globalCompositeOperation = "copy";

        this.layerList = [this.currentLayer]; // The renderer draw layers in order + preview layer position specified by renderPreviewPosition.
        this.renderPreviewPosition = -1; // -1 is at the end.

        this.currentTool = null;
        this.ui = ui;
        this.redraw = false;


        /** selection is a table of int between 0 and 255 that represents selected
         * pixels (initialized with number of pixels of current layer)
         * @todo : standardize selection dimention - layers ...
         */
        this.currentSelection = new PixelSelectionHandler(this.dimensions.x, this.dimensions.y);
        this.currentLayer.fill();

        this.link = new LocalLink(this);
    }


    enableNetwork(socket: SocketIOClient.Socket) {
        this.link = new NetworkLink(this, socket);

        this.link.sendAction({
            type: ActionType.ToolApply,
            toolName: "SelectionTool",
            actionData: {
                firstCorner: {x: 0, y: 0},
                lastCorner: {x: this.dimensions.x, y: this.dimensions.y},
                width: this.dimensions.x,
                height: this.dimensions.y
            },
            toolSettings: {
                shape: "square",
            },
        });
    }

    /**
     * Current tool getter.
     * @returns {Tool} Current tool used in the project.
     */
    getCurrentTool() : Tool {
        return this.currentTool;
    }

    /**
     * User interface handler getter.
     * @returns {UIController} The user interface handler.
     */
    getUI() : UIController {
        return this.ui;
    }

    /**
     * Update current tool.
     * @param {Tool} tool Tool to use.
     */
    changeTool (tool: Tool){
        this.currentTool = tool;
    };

    /**
     * Mouse click handler, transfers the event to the current tool, if one is selected.
     * @param {Vec2} vect Local coordinates in the drawing canvas.
     */
    mouseClick (vect: Vec2){
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
    mouseMove (vect: Vec2){
        if (this.currentTool !== null && this.usingTool === true){
            this.currentTool.continueUse(vect);

            let action = {
                toolName: this.currentTool.getName(),
                actionData: this.currentTool.getData(),
                type: ActionType.ToolPreview,
                toolSettings: this.currentTool.getSettings().exportParameters(),
            };

            action.toolSettings["layer"] = this.layerList.indexOf(this.currentLayer); // Encapsulate layer information.

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
    mouseRelease (vect: Vec2) {
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

    undo() {
        let action = {
            toolName: "Undo",
            actionData: "",
            type: ActionType.Undo,
            toolSettings: {}
        };
        this.link.sendAction(action);
    }

    redo() {
        let action = {
            toolName: "Redo",
            actionData: "",
            type: ActionType.Redo,
            toolSettings: {}
        };
        this.link.sendAction(action);
    }


    async applyAction (action: ActionInterface, selectionHandler: PixelSelectionHandler, generateHistory: boolean): Promise<ActionInterface> {
        if (action.type == ActionType.ToolApply) {
            this.renderPreviewPosition = -1;
            let tool = this.toolRegistry.getToolByName(action.toolName);
            tool.reset();
            tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
            tool.updateData(action.actionData);

            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);

            let draw_layer = action.toolSettings["layer"];
            console.log("Action on layer: " + draw_layer);

            if (!tool.overrideSelectionMask) { /// Applying selection mask.
                let history_save = "";
                if (generateHistory) {
                    history_save = this.layerList[draw_layer].getHTMLElement().toDataURL();
                }

                if (tool.readahead) {
                    // The tool can see what is in the layer on application.
                    this.previewLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                    this.layerList[draw_layer].applyInvMask(selectionHandler);
                }

                let undo = await tool.applyTool(this.previewLayer, generateHistory);

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


                this.previewLayer.applyMask(selectionHandler);
                this.layerList[draw_layer].getContext().drawImage(this.previewLayer.getHTMLElement(), 0, 0);

                this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                this.redraw = true;
                return undo;
            } else { /// Or not.
                let undo = await tool.applyTool(this.layerList[draw_layer], generateHistory);

                this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                this.redraw = true;
                return undo;
            }

        } else if (action.type == ActionType.ToolPreview) {
            if (this.ui == null) {
                return null; // No work on server side for preview.
            }

            let tool = this.toolRegistry.getToolByName(action.toolName);
            tool.reset();
            tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
            tool.updateData(action.actionData);

            this.previewLayer.reset();
            if (tool.readahead) {
                // The tool can see what is in the layer on application.
                let draw_layer = action.toolSettings["layer"];
                this.previewLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                this.workingLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);

                this.renderPreviewPosition = draw_layer;
            } else {
                this.renderPreviewPosition = -1;
            }
            tool.drawPreview(this.previewLayer);

            if (!tool.overrideSelectionMask) {
                // Optimized masking according to what is displayed.
                this.ui.viewport.applyMask(this.previewLayer, selectionHandler);
                this.ui.viewport.applyInvMask(this.workingLayer, selectionHandler);

                this.previewLayer.getContext().drawImage(this.workingLayer.getHTMLElement(), 0, 0);
            }

            this.redraw = true;
            return null;
        } else if (action.type == ActionType.DeleteLayer) {
            let i = action.actionData;
            let indexNewCurrentLayer;

            for(let j=0; j<this.layerList.length; j++) {
                if (this.currentLayer == this.layerList[j]){
                    if (i<j) { // if deleted layer is before selected layer, we have to decrease by 1
                        indexNewCurrentLayer = j-1;
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
                    indexNewCurrentLayer = i-1;
                    this.selectLayer(indexNewCurrentLayer);
                }
                else {
                    this.selectLayer(i+1);
                    indexNewCurrentLayer = i;
                }
                // delete layer i:
                this.layerList.splice(i,1);

            }
            else {
                backupContent = this.layerList[i].getHTMLElement().toDataURL();
                // delete layer i:
                this.layerList.splice(i,1);
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
        } else if (action.type == ActionType.AddLayer) {
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
    }

    /**
     * Tells whether the selection layer should be redrawn.
     * @returns {boolean} true if a redraw is needed, else false.
     */
    renderSelection () : boolean {
        if (this.currentSelection.getBorder().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Getter for layerList (for layerManager)
     */
    getLayerList () : Array<Layer> {
        return this.layerList
    };

    /**
     * Add a Layer in the layerList, just before the previewLayer and the selectionLayer
     */
    addLayer (){
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
    selectLayer (i: number){
        if (i >= this.layerList.length || i < 0){
            throw "try to select a layer that doesn't exist"
                ;
        }
        else{
            this.currentLayer = this.layerList[i];
        }
    };

    /**
     * Delete layer of index i
     * @param {number} i
     */
    deleteLayer (i: number) {
        let action = {
            toolName: "DeleteLayer",
            actionData: i,
            type: ActionType.DeleteLayer,
            toolSettings: {}
        };
        this.link.sendAction(action);
    };

    /**
     * Switch two Layers
     * @param {number} i First layer to switch, index starting from 0
     * @param {number} j Second layer to switch, index starting from 0
     */
    exchangeLayers (i: number, j: number){
        if (i >= this.layerList.length -1 || j >= this.layerList.length -1){
            throw "try to exchange a layer that doesn't exist with another one"
                ;
        }
        else{
            var temp = this.layerList[i];
            this.layerList[i] = this.layerList[j];
            this.layerList[j] = temp;
        }
    };

    /**
     * Saves the current project as a download of the resulting image
     * for the user
     */
    saveProject () {
        let content = this.currentLayer.getHTMLElement()
            .toDataURL("image/png")
            .replace("image/png","image/octet-stream");
        let fake_link = document.createElement('a');
        fake_link.download = this.name + '.png';
        fake_link.href = content;
        document.body.appendChild(fake_link);
        fake_link.click();
        document.body.removeChild(fake_link);
    }

    testSquare(elem: HTMLElement) {
        let color: string;
        if(squareRecon.hasSquare(this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y))) {
            color = "#6aeb70";
        } else {
            color = "#cc3058";
        }
        elem.setAttribute("style", "color: "+color);
    }
}
