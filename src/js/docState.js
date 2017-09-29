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
    function changeTool(tool){
	this.currentTool = tool;
    }

    /**
     *@brief: Specifies witch tool to begin using
     *@param {Vect2}: coordinates in the canvas
     */
    function mouseClick(vect){
	if (currentTool != undefined){
	    this.currentTool.startUse(vect);
	}
    }

    /**
     *@brief: Specifies witch tool to use
     *@param {Vect2}: coordinates in the canvas
     */
    function mouseMove(vect){
	if (currentTool != undefined){
	    this.currentTool.continueUse(vect);
	}
    }

    /**
     *@brief: Specifies witch tool to use
     *@param {Vect2}: coordinates in the canvas
     */
    function mouseRelease(vect){
	if (currentTool != undefined){
	    this.currentTool.endUse(vect);
	}
    }

    /**
     *@brief: Add a Layer at the end of the layerList
     */
    function addLayer(){
	this.layerList.append(Layer(layerList.length));
    }

    /**
     *@brief: Switch two Layers
     *@param {number, number}: positions of Layers to switch starting from 0
     */
    function exchangeLayers(i,j){
	if (i >= layerList.lenght || j >= layerList.lenght){
	    throw "try to exchange a layer that doesn't exist with another one"
	    ;
	}
	else{
	    temp = layerList[i];
	    layerList[i] = layerList[j];
	    layerList[j] = temp;

	    // update html canvas positions
	    layerList[i].setZIndex(i);
	    layerList[j].setZIndex(j);
	}
    }

    /**
     *@brief: remove a Layer
     *@param {number}: position Layer to remove starting from 0
     */
    function removeLayer(i){
	layerList.splice(i,1); // remove 1 element in position i
    }
}
