define(["require", "exports", "./layers", "./convnet_util"], function (require, exports, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LocalResponseNormalizationLayer extends layers_1.LayerBase {
        constructor(opt) {
            if (!opt) {
                return;
            }
            const lrnopt = opt;
            super(lrnopt);
            this.k = lrnopt.k;
            this.n = lrnopt.n;
            this.alpha = lrnopt.alpha;
            this.beta = lrnopt.beta;
            this.out_sx = lrnopt.in_sx;
            this.out_sy = lrnopt.in_sy;
            this.out_depth = lrnopt.in_depth;
            this.layer_type = 'lrn';
            if (this.n % 2 === 0) {
                console.log('WARNING n should be odd for LRN layer');
            }
        }
        forward(V) {
            this.in_act = V;
            const A = V.cloneAndZero();
            this.S_cache_ = V.cloneAndZero();
            const n2 = Math.floor(this.n / 2);
            for (let x = 0; x < V.sx; x++) {
                for (let y = 0; y < V.sy; y++) {
                    for (let i = 0; i < V.depth; i++) {
                        const ai = V.get(x, y, i);
                        let den = 0.0;
                        for (let j = Math.max(0, i - n2); j <= Math.min(i + n2, V.depth - 1); j++) {
                            const aa = V.get(x, y, j);
                            den += aa * aa;
                        }
                        den *= this.alpha / this.n;
                        den += this.k;
                        this.S_cache_.set(x, y, i, den);
                        den = Math.pow(den, this.beta);
                        A.set(x, y, i, ai / den);
                    }
                }
            }
            this.out_act = A;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            V.dw = util.zeros(V.w.length);
            const n2 = Math.floor(this.n / 2);
            for (let x = 0; x < V.sx; x++) {
                for (let y = 0; y < V.sy; y++) {
                    for (let i = 0; i < V.depth; i++) {
                        const chain_grad = this.out_act.get_grad(x, y, i);
                        const S = this.S_cache_.get(x, y, i);
                        const SB = Math.pow(S, this.beta);
                        const SB2 = SB * SB;
                        for (let j = Math.max(0, i - n2); j <= Math.min(i + n2, V.depth - 1); j++) {
                            const aj = V.get(x, y, j);
                            let g = -aj * this.beta * Math.pow(S, this.beta - 1) * this.alpha / this.n * 2 * aj;
                            if (j === i) {
                                g += SB;
                            }
                            g /= SB2;
                            g *= chain_grad;
                            V.add_grad(x, y, j, g);
                        }
                    }
                }
            }
        }
        getParamsAndGrads() {
            return [];
        }
        toJSON() {
            const json = {};
            json.k = this.k;
            json.n = this.n;
            json.alpha = this.alpha;
            json.beta = this.beta;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.out_depth = this.out_depth;
            json.layer_type = this.layer_type;
            return json;
        }
        fromJSON(json) {
            this.k = json.k;
            this.n = json.n;
            this.alpha = json.alpha;
            this.beta = json.beta;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.out_depth = json.out_depth;
            this.layer_type = json.layer_type;
        }
    }
    exports.LocalResponseNormalizationLayer = LocalResponseNormalizationLayer;
});
//# sourceMappingURL=convnet_layers_normalization.js.map