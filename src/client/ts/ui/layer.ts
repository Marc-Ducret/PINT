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

    clone(): Layer {
        let layer = new Layer(new Vec2(this.width, this.height));
        layer.getContext().drawImage(this.getHTMLElement(), 0, 0);
        return layer;
    }

    drawDataUrl(data: string, x: number, y: number): Promise<any> {
        return new Promise(resolve => {
            let imgtag = document.createElement("img");
            imgtag.src = data;
            imgtag.addEventListener("load", function() {
                this.getContext().drawImage(imgtag, x, y);
                resolve();
            }.bind(this));
        });
    }

    /***
     * @deprecated
     * @param {PixelSelectionHandler} selection
     */
    applyMask(selection: PixelSelectionHandler) {
        this.context.globalCompositeOperation = 'destination-in';
        this.context.drawImage(selection.getMask(), 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    isBlank() {
        let blank = ($("<canvas></canvas>") as JQuery<HTMLCanvasElement>)[0];
        blank.width = this.width;
        blank.height = this.height;
        return this.getHTMLElement().toDataURL() === blank.toDataURL();
    }
}
