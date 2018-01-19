define(["require", "exports", "jquery", "../vec2"], function (require, exports, $, vec2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Layer {
        constructor(dimensions) {
            this.canvasElement = $("<canvas></canvas>");
            this.context = this.canvasElement[0].getContext('2d');
            this.canvasElement[0].width = dimensions.x;
            this.canvasElement[0].height = dimensions.y;
            this.width = dimensions.x;
            this.height = dimensions.y;
            this.layerInfo = new LayerInfo();
            this.editMenuOpened = false;
        }
        getHTMLElement() {
            return this.canvasElement[0];
        }
        ;
        getContext() {
            return this.context;
        }
        ;
        reset() {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        ;
        fill() {
            this.context.fillStyle = "#ffffff";
            this.context.strokeStyle = "#ffffff";
            this.context.fillRect(0, 0, this.width, this.height);
        }
        ;
        getWidth() {
            return this.width;
        }
        getHeight() {
            return this.height;
        }
        clone() {
            let layer = new Layer(new vec2_1.Vec2(this.width, this.height));
            layer.getContext().drawImage(this.getHTMLElement(), 0, 0);
            return layer;
        }
        drawDataUrl(data, x, y) {
            return new Promise(resolve => {
                if (typeof process === 'object' && process + '' === '[object process]') {
                    const { Image } = require('canvas');
                    let img = new Image();
                    img.src = data;
                    this.getContext().drawImage(img, x, y);
                    resolve();
                }
                else {
                    let imgtag = document.createElement("img");
                    console.log("load");
                    imgtag.addEventListener("load", function () {
                        this.getContext().drawImage(imgtag, x, y);
                        console.log("loaded");
                        resolve();
                    }.bind(this));
                    imgtag.src = data;
                }
            });
        }
        applyMask(selection) {
            this.context.globalCompositeOperation = 'destination-in';
            this.context.drawImage(selection.getMask().getHTMLElement(), 0, 0);
            this.context.globalCompositeOperation = 'source-over';
        }
        applyInvMask(selection) {
            this.context.globalCompositeOperation = 'destination-out';
            this.context.drawImage(selection.getMask().getHTMLElement(), 0, 0);
            this.context.globalCompositeOperation = 'source-over';
        }
        mask(layer) {
            this.context.globalCompositeOperation = 'destination-in';
            this.context.drawImage(layer.getHTMLElement(), 0, 0);
            this.context.globalCompositeOperation = 'source-over';
        }
        drawSourceIn(layer) {
            this.context.globalCompositeOperation = 'source-in';
            this.context.drawImage(layer.getHTMLElement(), 0, 0);
            this.context.globalCompositeOperation = 'source-over';
        }
        isBlank() {
            let blank = $("<canvas></canvas>")[0];
            blank.width = this.width;
            blank.height = this.height;
            return this.getHTMLElement().toDataURL() === blank.toDataURL();
        }
    }
    exports.Layer = Layer;
    class LayerInfo {
        constructor() {
            this.name = "Layer";
            this.blur = false;
            this.shadow = false;
            this.show = true;
        }
        getFilter() {
            if (this.blur || this.shadow || !this.show) {
                let s = "";
                if (this.blur) {
                    s += "blur(5px) ";
                }
                if (this.shadow) {
                    s += "drop-shadow(5px 5px 5px #000000) ";
                }
                if (!this.show) {
                    s += "opacity(0) ";
                }
                return s;
            }
            else {
                return "none";
            }
        }
        clone() {
            let layerInfo = new LayerInfo();
            layerInfo.copyFrom(this);
            return layerInfo;
        }
        copyFrom(layerInfo) {
            this.name = layerInfo.name;
            this.blur = layerInfo.blur;
            this.shadow = layerInfo.shadow;
            this.show = layerInfo.show;
        }
        data() {
            return {
                name: this.name,
                blur: this.blur,
                shadow: this.shadow,
                show: this.show,
            };
        }
    }
    exports.LayerInfo = LayerInfo;
});
//# sourceMappingURL=layer.js.map