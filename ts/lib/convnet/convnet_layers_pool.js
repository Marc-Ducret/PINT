define(["require", "exports", "./convnet_vol", "./layers", "./convnet_util"], function (require, exports, convnet_vol_1, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PoolLayer extends layers_1.LayerBase {
        constructor(opt) {
            const popt = opt;
            super(popt);
            if (!opt) {
                return;
            }
            this.sx = popt.sx;
            this.in_depth = popt.in_depth;
            this.in_sx = popt.in_sx;
            this.in_sy = popt.in_sy;
            this.sy = typeof popt.sy !== 'undefined' ? popt.sy : this.sx;
            this.stride = typeof popt.stride !== 'undefined' ? popt.stride : 2;
            this.pad = typeof popt.pad !== 'undefined' ? popt.pad : 0;
            this.out_depth = this.in_depth;
            this.out_sx = Math.floor((this.in_sx + this.pad * 2 - this.sx) / this.stride + 1);
            this.out_sy = Math.floor((this.in_sy + this.pad * 2 - this.sy) / this.stride + 1);
            this.layer_type = 'pool';
            this.switchx = util.zeros(this.out_sx * this.out_sy * this.out_depth);
            this.switchy = util.zeros(this.out_sx * this.out_sy * this.out_depth);
        }
        forward(V) {
            this.in_act = V;
            const A = new convnet_vol_1.Vol(this.out_sx, this.out_sy, this.out_depth, 0.0);
            let n = 0;
            for (let d = 0; d < this.out_depth; d++) {
                let x = -this.pad;
                let y = -this.pad;
                for (let ax = 0; ax < this.out_sx; x += this.stride, ax++) {
                    y = -this.pad;
                    for (let ay = 0; ay < this.out_sy; y += this.stride, ay++) {
                        let a = -99999;
                        let winx = -1, winy = -1;
                        for (let fx = 0; fx < this.sx; fx++) {
                            for (let fy = 0; fy < this.sy; fy++) {
                                const oy = y + fy;
                                const ox = x + fx;
                                if (oy >= 0 && oy < V.sy && ox >= 0 && ox < V.sx) {
                                    const v = V.get(ox, oy, d);
                                    if (v > a) {
                                        a = v;
                                        winx = ox;
                                        winy = oy;
                                    }
                                }
                            }
                        }
                        this.switchx[n] = winx;
                        this.switchy[n] = winy;
                        n++;
                        A.set(ax, ay, d, a);
                    }
                }
            }
            this.out_act = A;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            V.dw = util.zeros(V.w.length);
            let n = 0;
            for (let d = 0; d < this.out_depth; d++) {
                let x = -this.pad;
                let y = -this.pad;
                for (let ax = 0; ax < this.out_sx; x += this.stride, ax++) {
                    y = -this.pad;
                    for (let ay = 0; ay < this.out_sy; y += this.stride, ay++) {
                        const chain_grad = this.out_act.get_grad(ax, ay, d);
                        V.add_grad(this.switchx[n], this.switchy[n], d, chain_grad);
                        n++;
                    }
                }
            }
        }
        getParamsAndGrads() {
            return [];
        }
        toJSON() {
            const json = {};
            json.sx = this.sx;
            json.sy = this.sy;
            json.stride = this.stride;
            json.in_depth = this.in_depth;
            json.out_depth = this.out_depth;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.layer_type = this.layer_type;
            json.pad = this.pad;
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.sx = json.sx;
            this.sy = json.sy;
            this.stride = json.stride;
            this.in_depth = json.in_depth;
            this.pad = (typeof json.pad !== 'undefined' ? json.pad : 0);
            this.switchx = util.zeros(this.out_sx * this.out_sy * this.out_depth);
            this.switchy = util.zeros(this.out_sx * this.out_sy * this.out_depth);
        }
    }
    exports.PoolLayer = PoolLayer;
});
//# sourceMappingURL=convnet_layers_pool.js.map