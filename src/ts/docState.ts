/**
 *@author {Milan Martos}
 *@brief Project class representing a project. (controller)
 */

import {Layer} from "./layer";
import {Tool} from "./tools/tool";
import {Vec2} from "./vec2";
import {PixelSelectionHandler} from "./selection/selection";
import {UIController} from "./ui";

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

    constructor (ui: UIController, name: string, dimensions: Vec2) {
        this.name = name;
        if (dimensions == null) {
            this.dimensions = new Vec2(800,600);
        } else {
            this.dimensions = dimensions;
        }
        this.previewLayer = new Layer(this.dimensions);
        this.currentLayer = new Layer(this.dimensions);
        this.selectionLayer = new Layer(this.dimensions);
        this.layerList = [this.currentLayer, this.previewLayer, this.selectionLayer]; // The renderer draw layers in order.
        this.currentTool = null;
        this.ui = ui;
        this.redraw = false;

        this.currentLayer.fill();

        /** selection is a table of int between 0 and 255 that represente selected
         *pixels (initialized with number of pixels of current layer)
         *@todo : standardize selection dimention - layers ...
         */
        this.currentSelection = new PixelSelectionHandler(this.dimensions.x, this.dimensions.y);

        this.currentLayer.fill();
    }

    getUI() : UIController {
        return this.ui;
    }

    /**
     *@brief: Specifies witch tool to use
     *@param {Tool} tool Tool to use
     */
    changeTool (tool: Tool){
	    this.currentTool = tool;
    };

    /**
     *@brief Specifies witch tool to begin using
     *@param {Vec2} vect coordinates in the canvas
     */

    mouseClick (vect: Vec2){
        if (this.currentTool !== null) {
            let img = this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y);
            this.currentTool.startUse(img, vect, this);
        }
    };

    /**
     * @brief Specifies witch tool to use
     * @param {Vec2} vect coordinates in the canvas
     * @returns true if the function updated one of the layers, else returns false.
     */

    mouseMove (vect: Vec2){
        let ctx = this.previewLayer.getContext();

        if (this.currentTool !== null){
            this.currentTool.continueUse(vect);
            this.previewLayer.reset();
            this.currentTool.drawPreview(this.previewLayer.getContext());
            this.redraw = true;
        }

        this.currentSelection.draw(ctx);
        return true;
    };

    /**
     * @brief Specifies witch tool to use
     * @param {Vec2} vect coordinates in the canvas
     */

    mouseRelease (vect: Vec2){
        if (this.currentTool !== null){
            if(this.currentTool.endUse(vect) === null) {
                this.previewLayer.reset();
                this.currentTool.drawPreview(this.previewLayer.getContext());
                this.currentLayer.getContext()
                    .drawImage(this.previewLayer.getHTMLElement(),0,0);
            }
            this.previewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
            this.redraw = true;
        }
    };

    renderSelection () : boolean {
        if (this.currentSelection.border.length > 0) {
            this.selectionLayer.reset();
            this.currentSelection.draw(this.selectionLayer.getContext());
            return true;
        } else {
            return false;
        }
    }

    /**
     *@brief Add a Layer at the end of the layerList
     */

    addLayer (){
	    this.layerList.push(new Layer(this.dimensions));
    };

    /**
     * @brief: Switch two Layers
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
     *@brief remove a Layer
     *@param {number} i Layer to remove starting from 0
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
