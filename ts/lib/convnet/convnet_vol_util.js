define(["require", "exports", "./convnet_vol", "./convnet_util"], function (require, exports, convnet_vol_1, uitl) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function augment(V, crop, dx, dy, fliplr) {
        if (typeof (fliplr) === 'undefined') {
            fliplr = false;
        }
        if (typeof (dx) === 'undefined') {
            dx = uitl.randi(0, V.sx - crop);
        }
        if (typeof (dy) === 'undefined') {
            dy = uitl.randi(0, V.sy - crop);
        }
        let W;
        if (crop !== V.sx || dx !== 0 || dy !== 0) {
            W = new convnet_vol_1.Vol(crop, crop, V.depth, 0.0);
            for (let x = 0; x < crop; x++) {
                for (let y = 0; y < crop; y++) {
                    if (x + dx < 0 || x + dx >= V.sx || y + dy < 0 || y + dy >= V.sy) {
                        continue;
                    }
                    for (let d = 0; d < V.depth; d++) {
                        W.set(x, y, d, V.get(x + dx, y + dy, d));
                    }
                }
            }
        }
        else {
            W = V;
        }
        if (fliplr) {
            const W2 = W.cloneAndZero();
            for (let x = 0; x < W.sx; x++) {
                for (let y = 0; y < W.sy; y++) {
                    for (let d = 0; d < W.depth; d++) {
                        W2.set(x, y, d, W.get(W.sx - x - 1, y, d));
                    }
                }
            }
            W = W2;
        }
        return W;
    }
    exports.augment = augment;
    function img_to_vol(img, convert_grayscale) {
        if (typeof (convert_grayscale) === 'undefined') {
            convert_grayscale = false;
        }
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        try {
            ctx.drawImage(img, 0, 0);
        }
        catch (e) {
            if (e.name === "NS_ERROR_NOT_AVAILABLE") {
                return false;
            }
            else {
                throw e;
            }
        }
        let img_data;
        try {
            img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        catch (e) {
            if (e.name === 'IndexSizeError') {
                return false;
            }
            else {
                throw e;
            }
        }
        const p = img_data.data;
        const W = img.width;
        const H = img.height;
        const pv = [];
        for (let i = 0; i < p.length; i++) {
            pv.push(p[i] / 255.0 - 0.5);
        }
        let x = new convnet_vol_1.Vol(W, H, 4, 0.0);
        x.w = pv;
        if (convert_grayscale) {
            const x1 = new convnet_vol_1.Vol(W, H, 1, 0.0);
            for (let i = 0; i < W; i++) {
                for (let j = 0; j < H; j++) {
                    x1.set(i, j, 0, x.get(i, j, 0));
                }
            }
            x = x1;
        }
        return x;
    }
    exports.img_to_vol = img_to_vol;
});
//# sourceMappingURL=convnet_vol_util.js.map