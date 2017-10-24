/**
 *@author {Milan Martos}
 *@brief class representing a selection, ie a set of selected pixels
 *@params {number, number} size in pixels
 */
import {Vec2} from "../vec2";
import {drawSelection} from "./selectionRender";
import {computeBorder} from "./selectionUtils";

/**
 * Contains a pixel selection mask. Value 0 means not selected, value 255 means totally selected.
 */
export class PixelSelection extends Uint8ClampedArray {}

export class PixelSelectionHandler {
    width: number;
    height: number;
    values: PixelSelection;
    border: Array<Vec2>;

    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.values = new PixelSelection(w*h);
        this.border = [];
    }

    /**
     *@brief change the size of the selection (delete previous selection)
     *@param {number} newSize
     */
    changeSize (newSize: number) {
       /* for(let i=0 ; i<newSize ; i++)
            this.values.push(0)*/
    }

    /**
     *@brief add pixels to the selection
     *@param {Vec2} p Coordinates
     *@param {number} intensity (between 0 and 1)
     */
    add (p: Vec2, intensity: number) {
	    this.values[Math.floor(p.x) + Math.floor(p.y)*this.width] = Math.min(0xFF, this.values[p.x + p.y*this.width] + intensity)
    }

    /**
     *@brief retrieve pixels from the selection
     *@param {Vec2} p Coordinates
     *@param {number} intensity (between 0 and 1)
     */
    retrieve (p: Vec2, intensity: number) {
        this.values[p.x + p.y*this.width] = Math.max(0, this.values[p.x + p.y*this.width] - intensity);
    }

    /**
     * @brief add a whole region to the selection
     * @param {PixelSelection} sel the region to add
     */
    addRegion(sel: PixelSelection) {
        for(let i in sel) {
            this.values[i] = Math.min(0xFF, this.values[i] + sel[i]);
        }
    }

    /**
     * Call to update the graphical representation of the selection
     */
    updateBorder() {
        this.border = computeBorder(this.values, this.width, this.height);
    }
    /**
     * Call to draw the selection using the given context
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx: CanvasRenderingContext2D) {
        drawSelection(this.border, ctx, this.width, this.height);
    }

    /**
     * Resets the selection to no pixel selected
     */
    reset() {
        this.values = new PixelSelection(this.width*this.height);
        this.border = [];
    }

    /**
     * @param {Vec2} p the position to test selection at
     * @return if the pixel at p is selected
     */
    isSelected(p: Vec2) {
        return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height
            && this.values[p.x + this.width * p.y] > 0;
    }
}
