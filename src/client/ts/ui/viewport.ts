import {Layer} from "./layer";
import {Vec2} from "../vec2";
import {PixelSelectionHandler} from "../selection/selection";

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
    fallbackDisplay: HTMLImageElement;

    /**
     * Constructs the viewport handler. Should be unique.
     * @param {JQuery<HTMLCanvasElement>} canvas Viewport canvas on which the rendering will be done.
     */
    constructor (canvas: JQuery<HTMLCanvasElement>, fallbackDisplay: HTMLImageElement) {
        this.canvas = canvas[0];
        this.context = this.canvas.getContext('2d');
        this.layerDimensions = new Vec2(0, 0);

        this.currentScale = 1;
        this.currentTranslation = new Vec2(0, 0);

        this.fallbackDisplay = fallbackDisplay;
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
    setLayerList (newLayerList: Array<Layer>) {
        if (newLayerList.length == 0) {
            this.layerDimensions.x = 0;
            this.layerDimensions.y = 0;
        } else {
            this.layerDimensions.x = newLayerList[0].getWidth();
            this.layerDimensions.y = newLayerList[0].getHeight();
        }
        this.layerList = newLayerList;
    };

    /**
     * Returns the scale of the rendering.
     * @returns {number} Local-pixel to real-pixel ratio.
     */
    getScale () : number {
        return this.currentScale;
    }

    /**
     * Sets the scale of the rendering.
     * @param {number} scale Local-pixel to real-pixel ratio.
     */
    setScale (scale: number) {
        this.currentScale = scale;
    }

    /**
     * Set the translation of the rendering, relative to the center of the viewport.
     * @param {Vec2} translation Translation vector, in local scale.
     */
    setTranslation (translation: Vec2) {
        this.currentTranslation = translation;
    }

    /**
     * Returns the current translation of the canvas, relative to the center of the viewport.
     * @returns {Vec2} Translation vector, in local scale.
     */
    getTranslation() {
        return this.currentTranslation;
    }

    /**
     * Render layers one by one in order, applying transformations such as zoom and translation.
     */
    renderLayers () {
        // Reset canvas
        this.resetCanvas();

        // fallback drawing a logo at the center of the picture.
        if (this.layerList.length == 0) {

            let scale = this.viewportDimensions.x/(2*this.fallbackDisplay.width);
            this.context.scale(scale, scale);
            this.context.globalAlpha = 0.2;
            this.context.drawImage(this.fallbackDisplay,this.fallbackDisplay.width/2,(this.viewportDimensions.y/scale/2 - (this.fallbackDisplay.height/scale/2)));
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            return;
        }

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

        let crop_dimensions = this.viewportDimensions.divide(this.currentScale, true);
        let translation_base = translation.divide(this.currentScale, true);

        // Render elements.
        for (let i in this.layerList) {
            this.context.drawImage(
                this.layerList[i].getHTMLElement(),
                -this.currentTranslation.x-translation_base.x,
                -this.currentTranslation.y-translation_base.y,
                crop_dimensions.x,
                crop_dimensions.y,
                0,
                0,
                this.viewportDimensions.x,
                this.viewportDimensions.y);
        }

        this.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    /**
     * Reset drawing canvas.
     */
    resetCanvas () {
        this.context.globalAlpha = 1;
        this.context.globalCompositeOperation = "source-over";
        this.context.fillStyle = "#202020";
        this.context.strokeStyle = "#202020";
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

    applyMask(layer: Layer, selection: PixelSelectionHandler) {
        let viewport_local_width = this.viewportDimensions.x / this.currentScale;
        let viewport_local_height = this.viewportDimensions.y / this.currentScale;

        let layer_width = layer.getWidth();
        let layer_height = layer.getHeight();


        let begin_x = -Math.min(0, viewport_local_width/2 - layer_width/2 + this.currentTranslation.x);
        let begin_y = -Math.min(0, viewport_local_height/2 - layer_height/2 + this.currentTranslation.y);

        let end_x = Math.min(layer_width, layer_width/2 + viewport_local_width/2 - this.currentTranslation.x);
        let end_y = Math.min(layer_height, layer_height/2 + viewport_local_height/2 - this.currentTranslation.y);

        let size_x = Math.min(end_x - begin_x, layer.getWidth() - begin_x);
        let size_y = Math.min(end_y - begin_y, layer.getHeight() - begin_y);

        //console.log("sx" + size_x + " |bx " + begin_x + " |ex " + end_x);

        layer.getContext().globalCompositeOperation = 'destination-in';
        layer.getContext().drawImage(selection.getMask(),
            begin_x,
            begin_y,
            size_x,
            size_y,
            begin_x,
            begin_y,
            size_x,
            size_y,
            );
        layer.getContext().globalCompositeOperation = 'source-over';
    }
}