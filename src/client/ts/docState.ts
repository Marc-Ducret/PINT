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
import {HistoryEntry} from "./history/historyEntry";
import * as squareRecon from "./image_utils/squareRecon";
import {ActionInterface, ActionType} from "./tools/actionInterface";
import {NetworkLink} from "./actionLink/networkLink";
import {ToolRegistry} from "./tools/toolregistry";
import {ActionLink} from "./actionLink/actionLink";
import {LocalLink} from "./actionLink/localLink";

/**
 * Project manager.
 */
export class Project {
    name: string;
    dimensions: Vec2;
    previewLayer: Layer;
    currentLayer: Layer;

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

        this.layerList = [this.currentLayer, this.previewLayer]; // The renderer draw layers in order.
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


            this.applyAction(action, this.currentSelection, false);

            if (this.currentTool.getSettings().canBeSentOverNetwork() === false) {
            } else {
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
            let tool = this.toolRegistry.getToolByName(action.toolName);
            tool.reset();
            tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
            tool.updateData(action.actionData);

            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);

            if (!tool.overrideSelectionMask) { /// Applying selection mask.
                let undo = await tool.applyTool(this.previewLayer, generateHistory);

                if (undo != null && undo.type == ActionType.ToolApplyHistory) {

                    undo.type = ActionType.ToolApply;
                    undo.toolName = "PasteTool";
                    undo.toolSettings = {
                        project_clipboard: this.currentLayer.getHTMLElement().toDataURL(),
                        project_clipboard_x: 0,
                        project_clipboard_y: 0,
                    };
                    undo.actionData = {x: 0, y: 0};
                }


                this.previewLayer.applyMask(selectionHandler);
                this.currentLayer.getContext().drawImage(this.previewLayer.getHTMLElement(), 0, 0);

                this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                this.redraw = true;
                return undo;
            } else { /// Or not.
                let undo = await tool.applyTool(this.currentLayer, generateHistory);

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
            tool.drawPreview(this.previewLayer);

            if (!tool.overrideSelectionMask) {
                // Optimized masking according to what is displayed.
                this.ui.viewport.applyMask(this.previewLayer, selectionHandler);
            }

            this.redraw = true;
            return null;
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
        // we substract 3 to let preview and selection in the two last positions of LayerList:
        let n_last_layer : number = this.layerList.length - 2; // index of old last "real" layer
        let l = new Layer(this.dimensions); // added layer
        l.reset(); // set added layer transparent
        // add the newly created Layer to layerList, just before position indexed by n_last_layer+1:
        this.layerList.splice(n_last_layer+1, 0, l);
        this.currentLayer = l;
    };

    /**
     * Set layer of index i as the current layer
     * @param {number} i
     */
    selectLayer (i: number){
        if (i >= this.layerList.length -1 || i < 0){
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
     * @return {number}
     */
    deleteLayer (i: number):number {
        let ret = 0;
        for(let j=0; j<this.layerList.length-1; j++) {
            if (this.currentLayer == this.layerList[j]){
                if (i<j) { // if deleted layer is before selected layer, we have to decrease by 1
                    ret = j-1;
                }
                else {
                    ret = j;
                }
            }
        }
        if (i >= this.layerList.length -1 || i < 0) {
            throw "try to delete a layer that doesn't exist";
        }
        else if (this.layerList.length -1 == 1) {
            console.warn("impossible to delete the only layer remaining");
        }
        else if (this.currentLayer == this.layerList[i]) {
            if (i == this.layerList.length -2) { // if layer i is the last layer
                ret = i-1;
                this.selectLayer(ret);
            }
            else {
                this.selectLayer(i+1);
                ret = i;
            }
            // delete layer i:
            this.layerList.splice(i,1);

        }
        else {
            // delete layer i:
            this.layerList.splice(i,1);
        }
        return ret;
    };

    /**
     * Switch two Layers
     * @param {number} i First layer to switch, index starting from 0
     * @param {number} j Second layer to switch, index starting from 0
     */
    exchangeLayers (i: number, j: number){
        if (i >= this.layerList.length || j >= this.layerList.length){
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
     * Remove a Layer
     * @param {number} i Layer to remove starting from 0
     */

    removeLayer (i: number){
        this.layerList.splice(i,1); // remove 1 element in position i
    }

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
