/**
 *@author {Milan Martos}
 *@brief Project class representing a project. (controller)
 */

import {Layer} from "./layer";
import {Tool} from "./tool";

export class Project {
    name: string;
    dimensions: Vec2;
    previewLayer: Layer;
    currentLayer: Layer;
    layerList: Array<Layer>; // The renderer draw layers in order.
    currentTool: Tool;

    constructor (name) {
        this.name = name;
        this.dimensions = new Vec2(800,600);
        this.previewLayer = new Layer(this.dimensions);
        this.currentLayer = new Layer(this.dimensions);
        this.layerList = [this.currentLayer, this.previewLayer]; // The renderer draw layers in order.
        this.currentTool = null;
        this.currentLayer.fill();
    }

    /**
     *@brief: Specifies witch tool to use
     *@param {Tool} tool Tool to use
     */
    changeTool (tool){
	    this.currentTool = tool;
    };

    /**
     *@brief Specifies witch tool to begin using
     *@param {Vec2} vect coordinates in the canvas
     */
    mouseClick (vect){
        if (this.currentTool !== null){
            this.currentTool.startUse(null, vect);
        }
    };

    /**
     * @brief Specifies witch tool to use
     * @param {Vec2} vect coordinates in the canvas
     * @returns true if the function updated one of the layers, else returns false.
     */
    mouseMove (vect){
        if (this.currentTool !== null){
            this.currentTool.continueUse(vect);
            this.previewLayer.reset();
            this.currentTool.drawPreview(this.previewLayer.getContext());
            return true;
        } else {
            return false;
        }
    };

    /**
     * @brief Specifies witch tool to use
     * @param {Vec2} vect coordinates in the canvas
     */
    mouseRelease (vect){
        if (this.currentTool !== null){
            if(this.currentTool.endUse(vect) === null) {
              this.currentLayer.getContext()
                .drawImage(this.previewLayer.getHTMLElement(),0,0);
            };
        }
    };

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
    exchangeLayers (i,j){
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
    removeLayer (i){
        this.layerList.splice(i,1); // remove 1 element in position i
    }

    /**
     * Saves the current project as a download of the resulting image
     * for the user
     */
    saveProject () {
        this.currentLayer.getHTMLElement().toBlob(function(blob) {
           // saveAs(blob, "project.png"); @TODO: fix this.
        });
    }
}
