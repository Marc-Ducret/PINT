import {Layer} from "./layer";
import {Vec2} from "./vec2";

/**
 * Handler of the final step of rendering.
 */
export class Viewport {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    layerDimensions: Vec2;
    viewportDimensions: Vec2;

    currentTranslation: Vec2;
    currentScale: number;

    layerList: Array<Layer> = [];


    constructor (canvas: JQuery<HTMLCanvasElement>, layerDimensions: Vec2) {
        this.canvas = canvas[0];
        this.context = this.canvas.getContext('2d');
        this.layerDimensions = layerDimensions;

        this.currentScale = 1;
        this.currentTranslation = new Vec2(0, 0);
    }

    /**
     * Reacts on the window resize event updates internal values.
     */
    viewportDimensionsChanged () {
        this.canvas.width = this.canvas.scrollWidth;
        this.canvas.height = this.canvas.scrollHeight;
        this.viewportDimensions = new Vec2(this.canvas.width, this.canvas.height);

        window.requestAnimationFrame(this.renderLayers.bind(this));
    };

    /**
     * Updates the list of rendered layers.
     * @param newLayerList
     */
    setLayerList (newLayerList) {
        this.layerList = newLayerList;
    };

    getScale () : number {
        return this.currentScale;
    }

    setScale (scale: number) {
        this.currentScale = scale;
    }

    setTranslation (translation: Vec2) {
        this.currentTranslation = translation;
    }

    /**
     * Render layers one by one in order, applying transformations such as zoom and translation.
     */
    renderLayers () {
        // Reset canvas
        this.resetCanvas();

        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;

        let translation = this.viewportDimensions
            .divide(2,true)
            .subtract(
                this.layerDimensions
                    .divide(2/this.currentScale,true)
                ,true);
            //.add(this.currentTranslation, true);

        // Set appropriate scale and translation.
        this.context.translate(translation.x, translation.y);
        this.context.scale(this.currentScale, this.currentScale);

        // Render elements.
        for (let i in this.layerList) {
            this.context.drawImage(this.layerList[i].getHTMLElement(),this.currentTranslation.x,this.currentTranslation.y);
        }

        this.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    /**
     * Reset drawing canvas.
     */
    resetCanvas () {
        this.context.fillStyle = "#303030";
        this.context.strokeStyle = "#303030";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    };

    /**
     * Converts a global position (in the render canvas) to its local position (in virtual canvas)
     * @param {Vec2} position
     * @returns {Vec2}
     */
    globalToLocalPosition (position: Vec2) {
        let translation = this.viewportDimensions
            .divide(2,true)
            .subtract(
                this.layerDimensions
                    .divide(2/this.currentScale,true)
                ,true);
        return position.subtract(translation, true)
            .divide(this.currentScale, true)
            .subtract(this.currentTranslation, true);
    }

    /**
     * Converts a local position (in virtual canvas) to its global position (in the render canvas)
     * @param {Vec2} position
     * @returns {Vec2}
     */
    localToGlobalPosition (position: Vec2) {
        let translation = this.viewportDimensions
            .divide(2,true)
            .subtract(
                this.layerDimensions
                    .divide(2/this.currentScale,true)
                ,true);

        return position.add(this.currentTranslation,true)
            .divide(1/this.currentScale, true)
            .add(translation, true);
    }

    getTranslation() {
        return this.currentTranslation;
    }
}