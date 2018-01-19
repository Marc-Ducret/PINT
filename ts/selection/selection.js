define(["require", "exports", "../vec2", "./selectionUtils", "../ui/layer"], function (require, exports, vec2_1, selectionUtils_1, layer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function PixelSelectionHandlerFromSerialized(serialized) {
        let w = serialized.width;
        let h = serialized.height;
        let obj = new PixelSelectionHandler(w, h);
        let img = new Image;
        img.onload = function () {
            obj.getMask().reset();
            obj.getMask().getContext().drawImage(img, 0, 0);
            let imgdata = obj.getMask().getContext().getImageData(0, 0, w, h);
            obj.values.forEach((val, i) => {
                obj.values[i] = imgdata[4 * i];
            });
        }.bind(this);
        img.src = serialized.dataUrl;
        return obj;
    }
    exports.PixelSelectionHandlerFromSerialized = PixelSelectionHandlerFromSerialized;
    class PixelSelectionHandler {
        serialize() {
            return {
                dataUrl: this.mask.getHTMLElement().toDataURL(),
                width: this.width,
                height: this.height
            };
        }
        constructor(w, h) {
            this.width = w;
            this.height = h;
            this.values = new Uint8ClampedArray(w * h);
            this.border = [];
            this.mask = new layer_1.Layer(new vec2_1.Vec2(w, h));
            this.mask.reset();
            this.mask.fill();
            for (let i = 0; i < w * h; i++) {
                this.values[i] = 0xFF;
            }
        }
        getMask() {
            return this.mask;
        }
        getValues() {
            return this.values;
        }
        add(p, intensity) {
            let i = Math.floor(p.x) + Math.floor(p.y) * this.width;
            let data = this.mask.getContext().getImageData(0, 0, this.width, this.height);
            this.values[i] = Math.min(0xFF, this.values[i] + intensity);
            data[4 * i + 3] = this.values[i];
            data[4 * i] = this.values[i];
            this.mask.getContext().putImageData(data, 0, 0);
        }
        retrieve(p, intensity) {
            this.values[p.x + p.y * this.width] = Math.max(0, this.values[p.x + p.y * this.width] - intensity);
        }
        addRegion(sel) {
            let imagedata = this.mask.getContext().getImageData(0, 0, this.width, this.height);
            sel.forEach((val, i) => {
                this.values[i] = Math.min(0xFF, this.values[i] + val);
                imagedata.data[4 * i + 3] = this.values[i];
            });
            this.mask.getContext().putImageData(imagedata, 0, 0);
        }
        updateBorder() {
            this.border = selectionUtils_1.computeBorder(this.values, this.width, this.height);
        }
        reset() {
            this.values = new Uint8ClampedArray(this.width * this.height);
            this.mask.reset();
            this.border = [];
        }
        isSelected(p) {
            return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height
                && this.values[p.x + this.width * p.y] > 0;
        }
        getSelectionIntensity(p) {
            if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
                return this.values[p.x + this.width * p.y];
            }
            else {
                return 0;
            }
        }
        getBorder() {
            return this.border;
        }
    }
    exports.PixelSelectionHandler = PixelSelectionHandler;
});
//# sourceMappingURL=selection.js.map