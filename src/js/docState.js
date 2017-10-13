/**
 *@author {Milan Martos}
 *@brief Project class representing a project. (controller)
 */

function Project(name) {
    this.name = name;
    this.dimensions = new Vec2(800,600);
    this.previewLayer = new Layer(this.dimensions);
    this.currentLayer = new Layer(this.dimensions);
    this.layerList = [this.currentLayer, this.previewLayer]; // The renderer draw layers in order.
    this.currentTool = null;

    /** selection is a table of int between 0 and 255 that represente selected
     *pixels (initialized with number of pixels of current layer)
     *@todo : standardize selection dimention - layers ...
     */
    this.currentSelection = [];
    for(var i=0;i<this.currentLayer.getWidth*this.currentLayer.getHeight();i++)
	this.currentSelection.append(0)

    this.currentLayer.fill();

    /**
     *@brief: Specifies witch tool to use
     *@param {Tool} tool Tool to use
     */
    this.changeTool = function(tool){
	    this.currentTool = tool;
    };

    /**
     *@brief Specifies witch tool to begin using
     *@param {Vec2} vect coordinates in the canvas
     */
    this.mouseClick = function(vect){
        if (this.currentTool !== null){
            this.currentTool.startUse(null, vect);
        }
    };

    /**
     * @brief Specifies witch tool to use
     * @param {Vec2} vect coordinates in the canvas
     * @returns true if the function updated one of the layers, else returns false.
     */
    this.mouseMove = function (vect){
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
    this.mouseRelease = function (vect){
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
    this.addLayer = function(){
	    this.layerList.append(Layer(this.layerList.length));
    };

    /**
     * @brief: Switch two Layers
     * @param {number} i First layer to switch, index starting from 0
     * @param {number} j Second layer to switch, index starting from 0
     */
    this.exchangeLayers = function(i,j){
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
    this.removeLayer = function(i){
        this.layerList.splice(i,1); // remove 1 element in position i
    }

    /**
     * Saves the current project as a download of the resulting image
     * for the user
     */
    this.saveProject = function() {
        this.currentLayer.getHTMLElement().toBlob(function(blob) {
            saveAs(blob, "project.png");
        });
    }
}
