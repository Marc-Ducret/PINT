/**
 *@author {Milan Martos}
 *@brief class representing a selection, ie a set of selected pixels
 *@params {number, number} size in pixels
 */
import {Vec2} from "../vec2";
import {drawSelection, resetBorder} from "./selectionRender";
import {computeBorder} from "./selectionUtils";
import {Layer} from "../ui/layer";

export interface SerializedPixelSelectionHandler {
    dataUrl: string;
    width: number;
    height: number;
}

export function PixelSelectionHandlerFromSerialized (serialized: SerializedPixelSelectionHandler): PixelSelectionHandler {
    let w = serialized.width;
    let h = serialized.height;
    let obj = new PixelSelectionHandler(null, w, h);


    let img = new Image;
    img.onload = function(){
        obj.getMask().getContext('2d').drawImage(img, 0, 0);
        let imgdata = obj.getMask().getContext('2d').getImageData(0, 0, w, h);
        obj.values.forEach((val, i) => {
            obj.values[i] = imgdata[4*i];
        });
    }.bind(this);
    img.src = serialized.dataUrl;
    return obj;
}

export class PixelSelectionHandler {
    private width: number;
    private height: number;
    public values: Uint8ClampedArray;
    private border: Array<Vec2>;

    private mask: Layer;

    private animation_image_data: ImageData;
    private animation_context: CanvasRenderingContext2D;

    serialize(): SerializedPixelSelectionHandler {
        return {dataUrl: this.mask.getHTMLElement().toDataURL(),
                width: this.width,
                height: this.height};
    }


    constructor(context: CanvasRenderingContext2D, w: number, h: number) {
        this.width = w;
        this.height = h;
        this.values = new Uint8ClampedArray(w * h);
        this.border = [];

        this.mask = new Layer(new Vec2(w, h));
        this.mask.reset();
        this.mask.fill();

        if (context != null) {
            this.animation_context = context;
            this.animation_image_data = context.getImageData(0, 0, w, h);
        }


        // select all at the beginning.
        for (let i = 0; i < w * h; i++) {
            this.values[i] = 0xFF;
        }
    }

    getMask(): HTMLCanvasElement {
        return this.mask.getHTMLElement();
    }

    getValues(): Uint8ClampedArray {
        return this.values;
    }


    /**
     *@brief add pixels to the selection
     *@param {Vec2} p Coordinates
     *@param {number} intensity (between 0 and 1)
     */
    add(p: Vec2, intensity: number) {
        let i = Math.floor(p.x) + Math.floor(p.y) * this.width;

        let data = this.mask.getContext().getImageData(0, 0, this.width, this.height);
        this.values[i] = Math.min(0xFF, this.values[i] + intensity);

        data[4 * i + 3] = this.values[i];
        data[4 * i] = this.values[i];
        this.mask.getContext().putImageData(data, 0, 0);
    }

    /**
     *@brief retrieve pixels from the selection
     *@param {Vec2} p Coordinates
     *@param {number} intensity (between 0 and 1)
     */
    retrieve(p: Vec2, intensity: number) {
        this.values[p.x + p.y * this.width] = Math.max(0, this.values[p.x + p.y * this.width] - intensity);
    }

    /**
     * @brief add a whole region to the selection
     * @param {Uint8ClampedArray} sel the region to add
     */
    addRegion(sel: Uint8ClampedArray) {
        let imagedata = this.mask.getContext().getImageData(0, 0, this.width, this.height);
        sel.forEach((val, i) => {
            this.values[i] = Math.min(0xFF, this.values[i] + val);
            imagedata.data[4 * i + 3] = this.values[i];
        });
        this.mask.getContext().putImageData(imagedata, 0, 0);
    }

    /**
     * Call to update the graphical representation of the selection
     */
    updateBorder() {
        if (this.animation_image_data != null) {
            resetBorder(this.animation_image_data, this.border, this.width, this.height);
            this.border = computeBorder(this.values, this.width, this.height);
        }
    }

    /**
     * Call to draw the selection
     */
    draw() {
        if (this.animation_context == null) {
            console.warn("Drawing on a null context.");
            return;
        }
        drawSelection(this.animation_image_data, this.border, this.width, this.height);
        this.animation_context.putImageData(this.animation_image_data, 0, 0);
    }

    /**
     * Resets the selection to no pixel selected
     */
    reset() {
        this.values = new Uint8ClampedArray(this.width * this.height);
        this.mask.reset();
        if (this.animation_image_data != null) {
            resetBorder(this.animation_image_data, this.border, this.width, this.height);
        }
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

    /**
     * @param {Vec2} p the position to test selection at
     * @return a value between 0 and 0xFF where 0 is not selected and 0xFF is fully selected
     */
    getSelectionIntensity(p: Vec2) {
        if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
            return this.values[p.x + this.width * p.y];
        } else {
            return 0;
        }
    }

    getBorder() {
        return this.border;
    }
}

