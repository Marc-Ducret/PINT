define(["require", "exports", "./convnet_util"], function (require, exports, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Vol {
        constructor(sx_or_list, sy, depth, c) {
            if (Array.isArray(sx_or_list)) {
                const list = sx_or_list;
                this.sx = 1;
                this.sy = 1;
                this.depth = list.length;
                this.w = util.zeros(this.depth);
                this.dw = util.zeros(this.depth);
                for (let i = 0; i < this.depth; i++) {
                    this.w[i] = list[i];
                }
            }
            else {
                const sx = sx_or_list;
                this.sx = sx;
                this.sy = sy;
                this.depth = depth;
                const n = sx * sy * depth;
                this.w = util.zeros(n);
                this.dw = util.zeros(n);
                if (typeof c === 'undefined') {
                    const scale = Math.sqrt(1.0 / (sx * sy * depth));
                    for (let i = 0; i < n; i++) {
                        this.w[i] = util.randn(0.0, scale);
                    }
                }
                else {
                    for (let i = 0; i < n; i++) {
                        this.w[i] = c;
                    }
                }
            }
        }
        get(x, y, d) {
            const ix = ((this.sx * y) + x) * this.depth + d;
            return this.w[ix];
        }
        set(x, y, d, v) {
            const ix = ((this.sx * y) + x) * this.depth + d;
            this.w[ix] = v;
        }
        add(x, y, d, v) {
            const ix = ((this.sx * y) + x) * this.depth + d;
            this.w[ix] += v;
        }
        get_grad(x, y, d) {
            const ix = ((this.sx * y) + x) * this.depth + d;
            return this.dw[ix];
        }
        set_grad(x, y, d, v) {
            const ix = ((this.sx * y) + x) * this.depth + d;
            this.dw[ix] = v;
        }
        add_grad(x, y, d, v) {
            const ix = ((this.sx * y) + x) * this.depth + d;
            this.dw[ix] += v;
        }
        cloneAndZero() { return new Vol(this.sx, this.sy, this.depth, 0.0); }
        clone() {
            const V = new Vol(this.sx, this.sy, this.depth, 0.0);
            const n = this.w.length;
            for (let i = 0; i < n; i++) {
                V.w[i] = this.w[i];
            }
            return V;
        }
        addFrom(V) { for (let k = 0; k < this.w.length; k++) {
            this.w[k] += V.w[k];
        } }
        addFromScaled(V, a) { for (let k = 0; k < this.w.length; k++) {
            this.w[k] += a * V.w[k];
        } }
        setConst(a) { for (let k = 0; k < this.w.length; k++) {
            this.w[k] = a;
        } }
        toJSON() {
            const json = { sx: this.sx, sy: this.sy, depth: this.depth, w: this.w };
            return json;
        }
        fromJSON(json) {
            this.sx = json.sx;
            this.sy = json.sy;
            this.depth = json.depth;
            const n = this.sx * this.sy * this.depth;
            this.w = util.zeros(n);
            this.dw = util.zeros(n);
            for (let i = 0; i < n; i++) {
                this.w[i] = json.w[i];
            }
        }
    }
    exports.Vol = Vol;
});
//# sourceMappingURL=convnet_vol.js.map