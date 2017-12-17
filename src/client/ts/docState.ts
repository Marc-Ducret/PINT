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
import {History} from "./history/history";
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
    selectionLayer: Layer;
    layerList: Array<Layer>; // The renderer draw layers in order.
    currentTool: Tool;
    currentSelection: PixelSelectionHandler;
    ui: UIController;
    redraw: boolean; // UIcontroller check this.redraw to now if it has to update the drawing
    history: History;
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
        this.previewLayer = new Layer(this.dimensions);
        this.previewLayer.getContext().translate(0.5, 0.5); // why translating of 0.5, 0.5 ?

        this.currentLayer = new Layer(this.dimensions);
        this.currentLayer.getContext().translate(0.5, 0.5);

        this.selectionLayer = new Layer(this.dimensions);
        this.layerList = [this.currentLayer, this.previewLayer, this.selectionLayer]; // The renderer draw layers in order.
        this.currentTool = null;
        this.ui = ui;
        this.redraw = false;

        this.netlink = null;

        this.currentLayer.fill();

        /** selection is a table of int between 0 and 255 that represents selected
         * pixels (initialized with number of pixels of current layer)
         * @todo : standardize selection dimention - layers ...
         */
        this.currentSelection = new PixelSelectionHandler(this.selectionLayer.getContext(), this.dimensions.x, this.dimensions.y);

        this.currentLayer.fill();

        this.history = new History(this);
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

            this.applyAction(action, this.currentSelection);
        }

        this.currentSelection.draw();
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
                this.applyAction(action, this.currentSelection);
            } else {
                this.netlink.sendAction(action);
            }

        }
    };


    applyAction (action: ActionInterface, selectionHandler: PixelSelectionHandler) {
        if (action.type == ActionType.ToolApply) {
            let tool = this.toolRegistry.getToolByName(action.toolName);
            tool.reset();
            tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
            tool.updateData(action.actionData);

            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);

            if (!tool.overrideSelectionMask) { /// Applying selection mask.
                tool.applyTool(this.previewLayer.getContext());

                this.previewLayer.applyMask(selectionHandler);

                this.currentLayer.getContext().drawImage(this.previewLayer.getHTMLElement(), -0.5, -0.5);
            } else { /// Or not.
                tool.applyTool(this.currentLayer.getContext());
            }

            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
            this.redraw = true;
        } else if (action.type == ActionType.ToolPreview) {
            if (this.ui == null) {
                return; // No work on server side for preview.
            }

            let tool = this.toolRegistry.getToolByName(action.toolName);
            tool.reset();
            tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
            tool.updateData(action.actionData);

            this.previewLayer.reset();
            tool.drawPreview(this.previewLayer.getContext());

            if (!tool.overrideSelectionMask) {
                // Optimized masking according to what is displayed.
                this.ui.viewport.applyMask(this.previewLayer, selectionHandler);
            }

            this.redraw = true;
        }
    }

    /**
     * Tells whether the selection layer should be redrawn.
     * @returns {boolean} true if a redraw is needed, else false.
     */
    renderSelection () : boolean {
        if (this.currentSelection.getBorder().length > 0) {
            this.selectionLayer.reset();
            this.currentSelection.draw();
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
        let n_last_layer : number = this.layerList.length - 3; // index of old last "real" layer
        let l = new Layer(this.dimensions); // added layer
        l.reset(); // set added layer transparent
        // add the newly created Layer to layerList, just before position indexed by n_last_layer+1:
        this.layerList.splice(n_last_layer+1, 0, l);
        this.currentLayer = l;
    };

    selectLayer (i: number){
        if (i >= this.layerList.length -2 || i < 0){//console.log(i.toString());
            throw "try to select a layer that doesn't exist"
                ;
        }
        else{
            this.currentLayer = this.layerList[i];
        }
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
