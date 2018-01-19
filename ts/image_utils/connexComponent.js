define(["require", "exports", "../vec2"], function (require, exports, vec2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function flatten(p, img_width) {
        return p.x + img_width * p.y;
    }
    function colorSelect(img, pos, threshold) {
        let w = img.width;
        let h = img.height;
        let toVisit = [pos];
        let selection = new Uint8ClampedArray(w * h);
        let explored = new Uint8ClampedArray(w * h);
        explored[flatten(pos, w)] = 1;
        let color = function (i) {
            return (img.data[i * 4 + 3] << 24)
                + (img.data[i * 4 + 2] << 16)
                + (img.data[i * 4 + 1] << 8)
                + (img.data[i * 4] << 0);
        };
        let addNeighbour = function (p) {
            if (explored[flatten(p, w)] === 0 && p.x >= 0 && p.x < w && p.y >= 0 && p.y < h) {
                explored[flatten(p, w)] = 1;
                toVisit.push(p);
            }
        };
        let indexToMatch = flatten(pos, w);
        let dist = function (i) {
            let s = 0;
            for (let j = 0; j < 3; j++) {
                s += Math.abs(img.data[i * 4 + j] - img.data[indexToMatch * 4 + j]);
            }
            return s;
        };
        while (toVisit.length > 0) {
            let p = toVisit.pop();
            let i = flatten(p, w);
            if (explored[i] === 1) {
                if (dist(i) / 3 <= threshold) {
                    selection[i] = 0xFF;
                    explored[i] = 2;
                    addNeighbour(new vec2_1.Vec2(p.x + 1, p.y));
                    addNeighbour(new vec2_1.Vec2(p.x - 1, p.y));
                    addNeighbour(new vec2_1.Vec2(p.x, p.y + 1));
                    addNeighbour(new vec2_1.Vec2(p.x, p.y - 1));
                }
            }
        }
        return selection;
    }
    exports.colorSelect = colorSelect;
});
//# sourceMappingURL=connexComponent.js.map