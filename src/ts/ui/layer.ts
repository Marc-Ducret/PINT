import * as $ from "jquery";
import {Vec2} from "../vec2";
import {PixelSelectionHandler} from "../selection/selection";

/**
 * Interface for a virtual HTML Canvas element.
 */
export class Layer {
    canvasElement: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor (dimensions: Vec2) {
        this.canvasElement = $("<canvas></canvas>") as JQuery<HTMLCanvasElement>;
        this.context = this.canvasElement[0].getContext('2d');

        this.canvasElement[0].width = dimensions.x;
        this.canvasElement[0].height = dimensions.y;
        this.width = dimensions.x;
        this.height = dimensions.y;
    }

    getHTMLElement () {
        return this.canvasElement[0];
    };

    getContext () {
        return this.context;
    };

    reset = function() {
        this.context.clearRect(0,0,this.width,this.height);
    };

    fill = function() {
        this.context.fillStyle = "#ffffff";
        this.context.strokeStyle = "#ffffff";
        this.context.fillRect(0,0,this.width,this.height);
    };

    getWidth() : number {
        return this.width;
    }

    getHeight() : number {
        return this.height;
    }

    applyMask(selection: Uint8ClampedArray) {
        let img = this.context.getImageData(0, 0, this.width, this.height);
        selection.forEach(function(value: number, index: number) {
           img.data[4*index+3] = value*img.data[4*index+3]/255;
        });
        this.context.putImageData(img, 0, 0);
    }
}
