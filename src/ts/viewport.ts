import {Layer} from "./layer";
import {Vec2} from "./vec2";

export class Viewport {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    layerDimensions: Vec2;
    viewportDimensions: Vec2;

    currentTranslation: Vec2;
    currentScale: number;

    layerList: Array<Layer> = [];


    constructor (canvas: JQuery<HTMLCanvasElement>, layerDimensions) {
        this.canvas = canvas[0];
        this.context = this.canvas.getContext('2d');
    }

    viewportDimensionsChanged () {
        this.canvas.width = this.canvas.scrollWidth;
        this.canvas.height = this.canvas.scrollHeight;
        this.viewportDimensions = new Vec2(this.canvas.width, this.canvas.height);

        this.currentTranslation = this.viewportDimensions.divide(2,true).subtract(this.layerDimensions.divide(2,true),true);
        this.currentScale = 1;
        window.requestAnimationFrame(this.renderLayers);
    };

    setLayerList (newLayerList) {
        this.layerList = newLayerList;
    };

    renderLayers () {
        // Reset canvas
        this.resetCanvas();

        // Set appropriate scale and translation.
        this.context.translate(this.currentTranslation.x, this.currentTranslation.y);
        this.context.scale(this.currentScale, this.currentScale);

        // Render elements.
        for (let i in this.layerList) {
            this.context.drawImage(this.layerList[i].getHTMLElement(),0,0);
        }

        this.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    resetCanvas () {
        this.context.fillStyle = "#303030";
        this.context.strokeStyle = "#303030";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    };

    globalToLocalPosition (position) {
        return position.subtract(this.currentTranslation, true).divide(this.currentScale);
    }
}