define(["require", "exports", "../vec2"], function (require, exports, vec2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function mask(selection, img) {
        selection.forEach(function (value, index) {
            img.data[4 * index + 3] = value * img.data[4 * index + 3] / 255;
        });
        return img;
    }
    exports.mask = mask;
    function isSelected(selection, x, y, w, h) {
        return x >= 0 && x < w && y >= 0 && y < h && selection[x + y * w] > 0;
    }
    exports.isSelected = isSelected;
    function computeBorder(selection, w, h) {
        let border = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (inBorder(x, y, selection, w, h)) {
                    border.push(new vec2_1.Vec2(x, y));
                }
            }
        }
        return border;
    }
    exports.computeBorder = computeBorder;
    function inBorder(x, y, selection, w, h) {
        return (isSelected(selection, x, y, w, h)
            && (!isSelected(selection, x - 1, y, w, h)
                || !isSelected(selection, x, y - 1, w, h)
                || !isSelected(selection, x + 1, y, w, h)
                || !isSelected(selection, x, y + 1, w, h)));
    }
    exports.inBorder = inBorder;
});
//# sourceMappingURL=selectionUtils.js.map