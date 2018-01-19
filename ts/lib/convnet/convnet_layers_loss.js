define(["require", "exports", "./convnet_vol", "./layers", "./convnet_util"], function (require, exports, convnet_vol_1, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SoftmaxLayer extends layers_1.LayerBase {
        constructor(opt) {
            const lopt = opt;
            super(lopt);
            if (!opt) {
                return;
            }
            this.num_inputs = lopt.in_sx * lopt.in_sy * lopt.in_depth;
            this.out_depth = this.num_inputs;
            this.out_sx = 1;
            this.out_sy = 1;
            this.layer_type = 'softmax';
        }
        forward(V) {
            this.in_act = V;
            const A = new convnet_vol_1.Vol(1, 1, this.out_depth, 0.0);
            const as = V.w;
            let amax = V.w[0];
            for (let i = 1; i < this.out_depth; i++) {
                if (as[i] > amax) {
                    amax = as[i];
                }
            }
            const es = util.zeros(this.out_depth);
            let esum = 0.0;
            for (let i = 0; i < this.out_depth; i++) {
                const e = Math.exp(as[i] - amax);
                esum += e;
                es[i] = e;
            }
            for (let i = 0; i < this.out_depth; i++) {
                es[i] /= esum;
                A.w[i] = es[i];
            }
            this.es = es;
            this.out_act = A;
            return this.out_act;
        }
        backward(y) {
            const x = this.in_act;
            x.dw = util.zeros(x.w.length);
            for (let i = 0; i < this.out_depth; i++) {
                const indicator = i === y ? 1.0 : 0.0;
                const mul = -(indicator - this.es[i]);
                x.dw[i] = mul;
            }
            return -Math.log(this.es[y]);
        }
        getParamsAndGrads() {
            return [];
        }
        toJSON() {
            const json = {};
            json.out_depth = this.out_depth;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.layer_type = this.layer_type;
            json.num_inputs = this.num_inputs;
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.num_inputs = json.num_inputs;
        }
    }
    exports.SoftmaxLayer = SoftmaxLayer;
    class RegressionLayer extends layers_1.LayerBase {
        constructor(opt) {
            const lopt = opt;
            super(lopt);
            if (!opt) {
                return;
            }
            this.num_inputs = lopt.in_sx * lopt.in_sy * lopt.in_depth;
            this.out_depth = this.num_inputs;
            this.out_sx = 1;
            this.out_sy = 1;
            this.layer_type = 'regression';
        }
        forward(V) {
            this.in_act = V;
            this.out_act = V;
            return V;
        }
        backward(y) {
            const x = this.in_act;
            x.dw = util.zeros(x.w.length);
            let loss = 0.0;
            if (y instanceof Array || y instanceof Float64Array) {
                for (let i = 0; i < this.out_depth; i++) {
                    const dy = x.w[i] - y[i];
                    x.dw[i] = dy;
                    loss += 0.5 * dy * dy;
                }
            }
            else if (typeof y === 'number') {
                const dy = x.w[0] - y;
                x.dw[0] = dy;
                loss += 0.5 * dy * dy;
            }
            else {
                const i = y.dim;
                const yi = y.val;
                const dy = x.w[i] - yi;
                x.dw[i] = dy;
                loss += 0.5 * dy * dy;
            }
            return loss;
        }
        getParamsAndGrads() {
            return [];
        }
        toJSON() {
            const json = {};
            json.out_depth = this.out_depth;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.layer_type = this.layer_type;
            json.num_inputs = this.num_inputs;
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.num_inputs = json.num_inputs;
        }
    }
    exports.RegressionLayer = RegressionLayer;
    class SVMLayer extends layers_1.LayerBase {
        constructor(opt) {
            const lopt = opt;
            super(lopt);
            if (!opt) {
                return;
            }
            this.num_inputs = lopt.in_sx * lopt.in_sy * lopt.in_depth;
            this.out_depth = this.num_inputs;
            this.out_sx = 1;
            this.out_sy = 1;
            this.layer_type = 'svm';
        }
        forward(V) {
            this.in_act = V;
            this.out_act = V;
            return V;
        }
        backward(y) {
            const x = this.in_act;
            x.dw = util.zeros(x.w.length);
            const yscore = x.w[y];
            const margin = 1.0;
            let loss = 0.0;
            for (let i = 0; i < this.out_depth; i++) {
                if (y === i) {
                    continue;
                }
                const ydiff = -yscore + x.w[i] + margin;
                if (ydiff > 0) {
                    x.dw[i] += 1;
                    x.dw[y] -= 1;
                    loss += ydiff;
                }
            }
            return loss;
        }
        getParamsAndGrads() {
            return [];
        }
        toJSON() {
            const json = {};
            json.out_depth = this.out_depth;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.layer_type = this.layer_type;
            json.num_inputs = this.num_inputs;
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.num_inputs = json.num_inputs;
        }
    }
    exports.SVMLayer = SVMLayer;
});
//# sourceMappingURL=convnet_layers_loss.js.map