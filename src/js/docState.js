/**
 *@author {Milan Martos}
 *@brief: Project class representing a project. (controler)
 */

function Project(name) {
    this.name = name;
    this.layerList = [new Layer(0)];
    this.layerList[0].insertAfter($("#base")); //insert canvas after html base
    this.currentTool = undefined;

    /**
     *@brief: Specifies witch tool to use
     *@param {Tool}
     */
    this.changeTool = function(tool){
	    this.currentTool = tool;
    };

    /**
     *@brief: Specifies witch tool to begin using
     *@param {Vect2}: coordinates in the canvas
     */
    this.mouseClick = function(vect){
        if (this.currentTool != undefined){
            this.currentTool.startUse(null, vect);
        }
    };

    /**
     *@brief: Specifies witch tool to use
     *@param {Vect2}: coordinates in the canvas
     */
    this.mouseMove = function (vect){
        if (this.currentTool != undefined){
            this.currentTool.continueUse(vect);
            this.layerList[0].reset();
            this.currentTool.drawPreview(this.layerList[0].getContext());
        }
    };

    /**
     *@brief: Specifies witch tool to use
     *@param {Vect2}: coordinates in the canvas
     */
    this.mouseRelease = function (vect){
        if (this.currentTool != undefined){
            this.currentTool.endUse(vect);
        }
    };

    /**
     *@brief: Add a Layer at the end of the layerList
     */
    this.addLayer = function(){
	    this.layerList.append(Layer(layerList.length));
    };

    /**
     *@brief: Switch two Layers
     *@param {number, number}: positions of Layers to switch starting from 0
     */
    this.exchangeLayers = function(i,j){
        if (i >= this.layerList.lenght || j >= this.layerList.lenght){
            throw "try to exchange a layer that doesn't exist with another one"
            ;
        }
        else{
            var temp = this.layerList[i];
            this.layerList[i] = this.layerList[j];
            this.layerList[j] = temp;

            // update html canvas positions
            this.layerList[i].setZIndex(i);
            this.layerList[j].setZIndex(j);
        }
    }

    /**
     *@brief: remove a Layer
     *@param {number}: position Layer to remove starting from 0
     */
    this.removeLayer = function(i){
        this.layerList.splice(i,1); // remove 1 element in position i
    }
}
