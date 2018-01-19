define(["require", "exports", "../vec2"], function (require, exports, vec2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Viewport {
        constructor(canvas, fallbackDisplay) {
            this.canvas = canvas[0];
            this.context = this.canvas.getContext('2d');
            this.layerDimensions = new vec2_1.Vec2(0, 0);
            this.currentScale = 1;
            this.currentTranslation = new vec2_1.Vec2(0, 0);
            this.fallbackDisplay = fallbackDisplay;
        }
        viewportDimensionsChanged() {
            this.canvas.width = this.canvas.scrollWidth;
            this.canvas.height = this.canvas.scrollHeight;
            this.viewportDimensions = new vec2_1.Vec2(this.canvas.width, this.canvas.height);
            window.requestAnimationFrame(function () {
                this.renderLayers(this.layerList, this.previewLayers, this.previewIndex, this.replaceLayer, this.pixelSelection);
            }.bind(this));
        }
        ;
        getScale() {
            return this.currentScale;
        }
        setScale(scale) {
            this.currentScale = scale;
        }
        setTranslation(translation) {
            this.currentTranslation = translation;
        }
        getTranslation() {
            return this.currentTranslation;
        }
        renderLayers(layerList, previewLayers, previewIndex, replaceLayer, pixelSelection) {
            this.layerList = layerList;
            this.previewLayers = previewLayers;
            this.previewIndex = previewIndex;
            this.pixelSelection = pixelSelection;
            this.replaceLayer = replaceLayer;
            if (layerList.length > 0) {
                this.layerDimensions.x = layerList[0].getWidth();
                this.layerDimensions.y = layerList[0].getHeight();
            }
            this.resetCanvas();
            let scale = this.viewportDimensions.x / (2 * this.fallbackDisplay.width);
            this.context.scale(scale, scale);
            this.context.globalAlpha = 0.2;
            this.context.drawImage(this.fallbackDisplay, this.fallbackDisplay.width / 2, (this.viewportDimensions.y / scale / 2 - (this.fallbackDisplay.height / scale / 2)));
            this.context.scale(1, 1);
            this.context.globalAlpha = 1;
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.imageSmoothingEnabled = false;
            this.context.webkitImageSmoothingEnabled = false;
            let translation = this.viewportDimensions
                .divide(2, true)
                .subtract(this.layerDimensions
                .divide(2 / this.currentScale, true), true);
            let crop_dimensions = this.viewportDimensions.divide(this.currentScale, true);
            let translation_base = translation.divide(this.currentScale, true);
            for (let i = 0; i < this.layerList.length; i++) {
                let layer = this.layerList[i];
                this.context.filter = layer.layerInfo.getFilter();
                if ((!replaceLayer) || (i != this.previewIndex)) {
                    this.context.drawImage(layer.getHTMLElement(), -this.currentTranslation.x - translation_base.x, -this.currentTranslation.y - translation_base.y, crop_dimensions.x, crop_dimensions.y, 0, 0, this.viewportDimensions.x, this.viewportDimensions.y);
                }
                if (i == this.previewIndex) {
                    for (let previewLayer of this.previewLayers) {
                        this.context.drawImage(previewLayer.getHTMLElement(), -this.currentTranslation.x - translation_base.x, -this.currentTranslation.y - translation_base.y, crop_dimensions.x, crop_dimensions.y, 0, 0, this.viewportDimensions.x, this.viewportDimensions.y);
                    }
                }
            }
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            if (this.pixelSelection.length > 0) {
                this.context.filter = "none";
                this.renderBorder(this.pixelSelection[0].getBorder(), this.pixelSelection[0].getValues());
            }
        }
        ;
        renderBorder(border, values) {
            const pattern = 10;
            const period = 500;
            const offset = (Date.now() % period) * pattern * 2 / period;
            const pixels_per_pixels = 1 + this.currentScale;
            for (let i in border) {
                const x = border[i].x;
                const y = border[i].y;
                const real_pos = this.localToGlobalPosition(new vec2_1.Vec2(x + 0.5, y + 0.5));
                const x_real = Math.floor(real_pos.x);
                const y_real = Math.floor(real_pos.y);
                if (x_real > -pixels_per_pixels
                    && x_real < this.viewportDimensions.x + pixels_per_pixels
                    && y_real > -pixels_per_pixels
                    && y_real < this.viewportDimensions.y + pixels_per_pixels) {
                    for (let d of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                        let dx = d[0];
                        let dy = d[1];
                        if (values[x + dx + (y + dy) * this.layerDimensions.x] == 0) {
                            for (let i = 0; i <= pixels_per_pixels; i += 1) {
                                if (dx == 0) {
                                    this.putSelectionPixel(x_real - pixels_per_pixels / 2 + i, y_real + dy * pixels_per_pixels / 2, offset);
                                }
                                else {
                                    this.putSelectionPixel(x_real + dx * pixels_per_pixels / 2, y_real - pixels_per_pixels / 2 + i, offset);
                                }
                            }
                        }
                    }
                }
            }
        }
        putSelectionPixel(x, y, offset) {
            const pattern = 10;
            this.context.lineWidth = 0;
            if (((x + y + offset) / pattern) % 2 < 1) {
                this.context.fillStyle = "#ffffffff";
            }
            else {
                this.context.fillStyle = "#000000ff";
            }
            this.context.fillRect(x, y, 1, 1);
        }
        resetCanvas() {
            this.context.globalAlpha = 1;
            this.context.globalCompositeOperation = "source-over";
            this.context.fillStyle = "#202020";
            this.context.strokeStyle = "#202020";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        ;
        globalToLocalPosition(position) {
            let translation = this.viewportDimensions
                .divide(2, true)
                .subtract(this.layerDimensions
                .divide(2 / this.currentScale, true), true);
            return position.subtract(translation, true)
                .divide(this.currentScale, true)
                .subtract(this.currentTranslation, true);
        }
        localToGlobalPosition(position) {
            let translation = this.viewportDimensions
                .divide(2, true)
                .subtract(this.layerDimensions
                .divide(2 / this.currentScale, true), true);
            return position.add(this.currentTranslation, true)
                .divide(1 / this.currentScale, true)
                .add(translation, true);
        }
        applyComposition(layer, selection, method) {
            let viewport_local_width = this.viewportDimensions.x / this.currentScale;
            let viewport_local_height = this.viewportDimensions.y / this.currentScale;
            let layer_width = layer.getWidth();
            let layer_height = layer.getHeight();
            let begin_x = -Math.min(0, viewport_local_width / 2 - layer_width / 2 + this.currentTranslation.x);
            let begin_y = -Math.min(0, viewport_local_height / 2 - layer_height / 2 + this.currentTranslation.y);
            let end_x = Math.min(layer_width, layer_width / 2 + viewport_local_width / 2 - this.currentTranslation.x);
            let end_y = Math.min(layer_height, layer_height / 2 + viewport_local_height / 2 - this.currentTranslation.y);
            let size_x = Math.min(end_x - begin_x, layer.getWidth() - begin_x);
            let size_y = Math.min(end_y - begin_y, layer.getHeight() - begin_y);
            layer.getContext().globalCompositeOperation = method;
            layer.getContext().drawImage(selection.getMask().getHTMLElement(), begin_x, begin_y, size_x, size_y, begin_x, begin_y, size_x, size_y);
            layer.getContext().globalCompositeOperation = 'source-over';
        }
        applyMask(layer, selection) {
            this.applyComposition(layer, selection, 'destination-in');
        }
        applyInvMask(layer, selection) {
            this.applyComposition(layer, selection, 'destination-out');
        }
    }
    exports.Viewport = Viewport;
});
//# sourceMappingURL=viewport.js.map