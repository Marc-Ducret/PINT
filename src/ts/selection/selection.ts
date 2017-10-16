/**
 *@author {Milan Martos}
 *@brief class representing a selection, ie a set of selected pixels
 *@params {number, number} size in pixels
 */
import {Vec2} from "../vec2";

class PixelSelection {
    width: number;
    height: number;
    values: Float32Array;

    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.values = new Float32Array(w*h);
    }


    /**
     *@brief change the size of the selection (delete previous selection)
     *@param {number} newSize
     */
    changeSize (newSize: number){
       /* for(let i=0 ; i<newSize ; i++)
            this.values.push(0)*/
    };

    /**
     *@brief add pixels to the selection
     *@param {Vec2} v2 Coordinates
     *@param {number} intensity (between 0 and 1)
     */
    add (v2: Vec2, intensity: number){
	    this.values[v2.x + v2.y*this.width] += intensity;
        if (this.values[v2.x + v2.y*this.width] > 1)
            this.values[v2.x + v2.y*this.width] = 1;
    };

    /**
     *@brief retrieve pixels from the selection
     *@param {Vec2} v2 Coordinates
     *@param {number} intensity (between 0 and 1)
     */
    retrieve (v2: Vec2, intensity: number){
        this.values[v2.x + v2.y*this.width] -= intensity;
        if (this.values[v2.x + v2.y*this.width] < 0)
            this.values[v2.x + v2.y*this.width] = 0;
    };
}
