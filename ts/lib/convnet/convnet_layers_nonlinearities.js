define(["require", "exports", "./convnet_vol", "./layers", "./convnet_util"], function (require, exports, convnet_vol_1, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OutputLayer extends layers_1.LayerBase {
        constructor(opt) {
            super(opt);
            if (!opt) {
                return;
            }
            this.out_sx = opt.in_sx;
            this.out_sy = opt.in_sy;
            this.out_depth = opt.in_depth;
        }
    }
    exports.OutputLayer = OutputLayer;
    class ReluLayer extends OutputLayer {
        constructor(opt) {
            super(opt);
            if (!opt) {
                return;
            }
            this.layer_type = 'relu';
        }
        forward(V) {
            this.in_act = V;
            const V2 = V.clone();
            const N = V.w.length;
            const V2w = V2.w;
            for (let i = 0; i < N; i++) {
                if (V2w[i] < 0) {
                    V2w[i] = 0;
                }
                this.out_act = V2;
                return this.out_act;
            }
        }
        backward() {
            const V = this.in_act;
            const V2 = this.out_act;
            const N = V.w.length;
            V.dw = util.zeros(N);
            for (let i = 0; i < N; i++) {
                if (V2.w[i] <= 0) {
                    V.dw[i] = 0;
                }
                else {
                    V.dw[i] = V2.dw[i];
                }
            }
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
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
        }
    }
    exports.ReluLayer = ReluLayer;
    class SigmoidLayer extends OutputLayer {
        constructor(opt) {
            super(opt);
            if (!opt) {
                return;
            }
            this.layer_type = 'sigmoid';
        }
        forward(V) {
            this.in_act = V;
            const V2 = V.cloneAndZero();
            const N = V.w.length;
            const V2w = V2.w;
            const Vw = V.w;
            for (let i = 0; i < N; i++) {
                V2w[i] = 1.0 / (1.0 + Math.exp(-Vw[i]));
            }
            this.out_act = V2;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            const V2 = this.out_act;
            const N = V.w.length;
            V.dw = util.zeros(N);
            for (let i = 0; i < N; i++) {
                const v2wi = V2.w[i];
                V.dw[i] = v2wi * (1.0 - v2wi) * V2.dw[i];
            }
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
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
        }
    }
    exports.SigmoidLayer = SigmoidLayer;
    class MaxoutLayer extends OutputLayer {
        constructor(opt) {
            const mopt = opt;
            super(mopt);
            if (!opt) {
                return;
            }
            this.group_size = typeof mopt.group_size !== 'undefined' ? mopt.group_size : 2;
            this.out_depth = Math.floor(mopt.in_depth / this.group_size);
            this.layer_type = 'maxout';
            this.switches = util.zeros(this.out_sx * this.out_sy * this.out_depth);
        }
        forward(V) {
            this.in_act = V;
            const N = this.out_depth;
            const V2 = new convnet_vol_1.Vol(this.out_sx, this.out_sy, this.out_depth, 0.0);
            if (this.out_sx === 1 && this.out_sy === 1) {
                for (let i = 0; i < N; i++) {
                    const ix = i * this.group_size;
                    let a = V.w[ix];
                    let ai = 0;
                    for (let j = 1; j < this.group_size; j++) {
                        const a2 = V.w[ix + j];
                        if (a2 > a) {
                            a = a2;
                            ai = j;
                        }
                    }
                    V2.w[i] = a;
                    this.switches[i] = ix + ai;
                }
            }
            else {
                let n = 0;
                for (let x = 0; x < V.sx; x++) {
                    for (let y = 0; y < V.sy; y++) {
                        for (let i = 0; i < N; i++) {
                            const ix = i * this.group_size;
                            let a = V.get(x, y, ix);
                            let ai = 0;
                            for (let j = 1; j < this.group_size; j++) {
                                const a2 = V.get(x, y, ix + j);
                                if (a2 > a) {
                                    a = a2;
                                    ai = j;
                                }
                            }
                            V2.set(x, y, i, a);
                            this.switches[n] = ix + ai;
                            n++;
                        }
                    }
                }
            }
            this.out_act = V2;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            const V2 = this.out_act;
            const N = this.out_depth;
            V.dw = util.zeros(V.w.length);
            if (this.out_sx === 1 && this.out_sy === 1) {
                for (let i = 0; i < N; i++) {
                    const chain_grad = V2.dw[i];
                    V.dw[this.switches[i]] = chain_grad;
                }
            }
            else {
                let n = 0;
                for (let x = 0; x < V2.sx; x++) {
                    for (let y = 0; y < V2.sy; y++) {
                        for (let i = 0; i < N; i++) {
                            const chain_grad = V2.get_grad(x, y, i);
                            V.set_grad(x, y, this.switches[n], chain_grad);
                            n++;
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
            json.out_depth = this.out_depth;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.layer_type = this.layer_type;
            json.group_size = this.group_size;
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.group_size = json.group_size;
            this.switches = util.zeros(this.group_size);
        }
    }
    exports.MaxoutLayer = MaxoutLayer;
    function tanh(x) {
        const y = Math.exp(2 * x);
        return (y - 1) / (y + 1);
    }
    class TanhLayer extends OutputLayer {
        constructor(opt) {
            super(opt);
            if (!opt) {
                return;
            }
            this.layer_type = 'tanh';
        }
        forward(V) {
            this.in_act = V;
            const V2 = V.cloneAndZero();
            const N = V.w.length;
            for (let i = 0; i < N; i++) {
                V2.w[i] = tanh(V.w[i]);
            }
            this.out_act = V2;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            const V2 = this.out_act;
            const N = V.w.length;
            V.dw = util.zeros(N);
            for (let i = 0; i < N; i++) {
                const v2wi = V2.w[i];
                V.dw[i] = (1.0 - v2wi * v2wi) * V2.dw[i];
            }
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
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
        }
    }
    exports.TanhLayer = TanhLayer;
});
//# sourceMappingURL=convnet_layers_nonlinearities.js.map