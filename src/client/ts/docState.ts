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
import {NetworkLink} from "./networkLink";
import {ToolRegistry} from "./tools/toolregistry";

/**
 * Project manager.
 */
export class Project {
    name: string;
    dimensions: Vec2;
    previewLayer: Layer;
    currentLayer: Layer;
    workingLayer: Layer;

    layerList: Array<Layer>; // The renderer draw layers in order.
    currentTool: Tool;
    currentSelection: PixelSelectionHandler;
    ui: UIController;
    redraw: boolean;
    history: PintHistory;
    toolRegistry: ToolRegistry;
    private netlink: NetworkLink;
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
        this.workingLayer = new Layer(this.dimensions);
        this.workingLayer.getContext().translate(0.5, 0.5);

        this.previewLayer = new Layer(this.dimensions);
        this.previewLayer.getContext().translate(0.5, 0.5); // why translating of 0.5, 0.5 ?

        this.currentLayer = new Layer(this.dimensions);
        this.currentLayer.getContext().translate(0.5, 0.5);

        this.layerList = [this.currentLayer, this.previewLayer]; // The renderer draw layers in order.
        this.currentTool = null;
        this.ui = ui;
        this.redraw = false;

        this.netlink = null;

        this.currentLayer.fill();

        /** selection is a table of int between 0 and 255 that represents selected
         * pixels (initialized with number of pixels of current layer)
         * @todo : standardize selection dimention - layers ...
         */
        this.currentSelection = new PixelSelectionHandler(this.dimensions.x, this.dimensions.y);

        this.currentLayer.fill();
    }


    enableNetwork(socket: SocketIOClient.Socket) {
        this.netlink = new NetworkLink(this, socket);
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

            if (this.netlink === null || this.currentTool.getSettings().canBeSentOverNetwork() === false) {
            } else {
                this.netlink.sendAction(action);
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

            if (this.netlink === null || this.currentTool.getSettings().canBeSentOverNetwork() === false) {
                this.applyAction(action, this.currentSelection, false);
            } else {
                this.netlink.sendAction(action);
            }

        }
    };

    undo() {
        if (this.netlink !== null) {
            let action = {
                toolName: "Undo",
                actionData: "",
                type: ActionType.Undo,
                toolSettings: {}
            };
            this.netlink.sendAction(action);
        } else { /// TODO: Implement local version.

        }
    }

    redo() {
        if (this.netlink !== null) {
            let action = {
                toolName: "Redo",
                actionData: "",
                type: ActionType.Redo,
                toolSettings: {}
            };
            this.netlink.sendAction(action);
        } else { /// TODO: Implement local version.

        }

    }


    async applyAction (action: ActionInterface, selectionHandler: PixelSelectionHandler, generateHistory: boolean): Promise<ActionInterface> {
        if (action.type == ActionType.ToolApply) {
            let tool = this.toolRegistry.getToolByName(action.toolName);
            tool.reset();
            tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
            tool.updateData(action.actionData);

            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);

            if (!tool.overrideSelectionMask) { /// Applying selection mask.

                console.log("App1cation of tool");

                let undo = await tool.applyTool(this.previewLayer, generateHistory);

                console.log("Application of tool");

                if (undo != null && undo.type == ActionType.ToolApplyHistory) {
                    this.workingLayer.getContext().imageSmoothingEnabled = false;
                    await tool.applyTool(this.workingLayer, false);
                    this.workingLayer.draw_source_in(this.currentLayer);

                    undo.type = ActionType.ToolApply;
                    undo.toolName = "PasteTool";
                    undo.toolSettings = {
                        project_clipboard: this.workingLayer.getHTMLElement().toDataURL(),
                        project_clipboard_x: 0,
                        project_clipboard_y: 0,
                    };
                    undo.actionData = {x: 0, y: 0};

                    this.workingLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                }


                this.previewLayer.applyMask(selectionHandler);
                this.currentLayer.getContext().drawImage(this.previewLayer.getHTMLElement(), -0.5, -0.5);

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
	    //this.layerList.push(new Layer(this.dimensions));
        this.layerList.splice(this.layerList.length - 3, 0, new Layer(this.dimensions));
        this.currentLayer = this.layerList[this.layerList.length - 3];
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

    testSquare() {
        console.log("square: "+squareRecon.hasSquare(this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y)));
    }
}
