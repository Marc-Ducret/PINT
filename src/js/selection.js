/**
 *@author {Milan Martos}
 *@brief class representing a selection, ie a set of selected pixels
 *@params {number, number} size in pixels
 */

function Selection(w, h) {
    this.width = w;
    this.height = h;
    this.values = [];
    for(var i=0 ; i<w*h ; i++)
	this.values.append(0)

    /**
     *@brief change the size of the selection (delete previous selection)
     *@param {number} newSize
     */
    this.changeSize = function(newSize){
	for(var i=0 ; i<newSize ; i++)
	    this.values.append(0)
    };

    /**
     *@brief add pixels to the selection
     *@param {Vec2, number} coordinates, intensity (between 0 and 255)
     */
    this.add = function(v2, intensity){
	this.values[v2[0]*this.width, // @todo check syntaxe
		    v2[1]*this.height] += intensity;
	if (this.values[v2[0]*this.width, v2[1]*this.height] > 255)
	    this.values[v2[0]*this.width, v2[1]*this.height] = 255;
    };

    /**
     *@brief retrieve pixels from the selection
     *@param {Vec2, number} coordinates, intensity (between 0 and 255)
     */
    this.retrieve = function(v2, intensity){
	this.values[v2[0]*this.width, // @todo check syntaxe
		    v2[1]*this.height] -= intensity;
	if (this.values[v2[0]*this.width, v2[1]*this.height] < 0)
	    this.values[v2[0]*this.width, v2[1]*this.height] = 0;
    };
}
