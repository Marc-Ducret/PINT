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
    redraw: boolean;

    /**
     * Instantiates a project.
     *
     * @param {UIController} ui User interface manager
     * @param {string} name Name of the project
     * @param {Vec2} dimensions Dimensions of the picture
     */
    constructor (ui: UIController, name: string, dimensions: Vec2) {
        this.name = name;
        if (dimensions == null) {
            this.dimensions = new Vec2(800,600);
        } else {
            this.dimensions = dimensions;
        }
        this.previewLayer = new Layer(this.dimensions);
        this.previewLayer.getContext().translate(0.5, 0.5);

        this.currentLayer = new Layer(this.dimensions);
        this.selectionLayer = new Layer(this.dimensions);
        this.layerList = [this.currentLayer, this.previewLayer, this.selectionLayer]; // The renderer draw layers in order.
        this.currentTool = null;
        this.ui = ui;
        this.redraw = false;

        this.currentLayer.fill();

        /** selection is a table of int between 0 and 255 that represents selected
         * pixels (initialized with number of pixels of current layer)
         * @todo : standardize selection dimention - layers ...
         */
        this.currentSelection = new PixelSelectionHandler(this.selectionLayer.getContext(), this.dimensions.x, this.dimensions.y);

        this.currentLayer.fill();
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
            let img = this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y);
            if (!this.currentTool.overrideSelectionMask) {
                img = mask(this.currentSelection.getValues(), img);
            }
            this.currentTool.startUse(img, vect, this);
        }
    };

    /**
     * Mouse move handler, called after a mouseClick and before a mouseRelease. Updates pre-rendering and transfers the
     * event to the selected tool, if there's one. Asks the renderer to redraw.
     * @param {Vec2} vect Local coordinates in the drawing canvas.
     * @returns true if the function updated one of the layers, else returns false.
     */
    mouseMove (vect: Vec2){
        let ctx = this.previewLayer.getContext();

        if (this.currentTool !== null){
            this.currentTool.continueUse(vect);

            this.previewLayer.reset();
            this.currentTool.drawPreview(this.previewLayer.getContext());

            if (!this.currentTool.overrideSelectionMask) {
                this.ui.viewport.applyMask(this.previewLayer, this.currentSelection);
            }

            this.redraw = true;
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
    mouseRelease (vect: Vec2){
        if (this.currentTool !== null){
            if(this.currentTool.endUse(vect) === null) {
                this.previewLayer.reset();
                this.currentTool.drawPreview(this.previewLayer.getContext());
                if (!this.currentTool.overrideSelectionMask) {
                    this.previewLayer.applyMask(this.currentSelection);
                }

                this.currentLayer.getContext()
                    .drawImage(this.previewLayer.getHTMLElement(),0,0);
            }
            this.currentTool.reset();
            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
            this.redraw = true;
        }
    };

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
     * Add a Layer at the end of the layerList
     */
    addLayer (){
	    this.layerList.push(new Layer(this.dimensions));
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
}
