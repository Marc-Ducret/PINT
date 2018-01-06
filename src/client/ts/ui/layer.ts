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

    getContext(): CanvasRenderingContext2D {
        return this.context;
    };

    reset() {
        this.context.clearRect(0,0,this.width,this.height);
    };

    fill() {
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

    clone(): Layer {
        let layer = new Layer(new Vec2(this.width, this.height));
        layer.getContext().drawImage(this.getHTMLElement(), 0, 0);
        return layer;
    }

    drawDataUrl(data: string, x: number, y: number): Promise<any> {
        return new Promise(resolve => {
            if(typeof process === 'object' && process + '' === '[object process]'){
                // is node
                const { Image } = require('canvas');

                let img = new Image();
                img.src = data;

                this.getContext().drawImage(img, x, y);
                resolve();
            }
            else{
                // not node
                let imgtag = document.createElement("img");
                console.log("load");

                imgtag.addEventListener("load", function() {
                    this.getContext().drawImage(imgtag, x, y);
                    console.log("loaded");
                    resolve();
                }.bind(this));
                imgtag.src = data;
            }
        });
    }

    /***
     *
     * @param {PixelSelectionHandler} selection
     */
    applyMask(selection: PixelSelectionHandler) {
        this.context.globalCompositeOperation = 'destination-in';
        this.context.drawImage(selection.getMask(), 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    mask(layer: Layer) {
        this.context.globalCompositeOperation = 'destination-in';
        this.context.drawImage(layer.getHTMLElement(), 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    drawSourceIn(layer: Layer) {
        this.context.globalCompositeOperation = 'source-in';
        this.context.drawImage(layer.getHTMLElement(), 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    isBlank() {
        let blank = ($("<canvas></canvas>") as JQuery<HTMLCanvasElement>)[0];
        blank.width = this.width;
        blank.height = this.height;
        return this.getHTMLElement().toDataURL() === blank.toDataURL();
    }

}
