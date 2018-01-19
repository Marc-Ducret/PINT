define(["require", "exports", "./layers", "./convnet_util"], function (require, exports, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DropoutLayer extends layers_1.LayerBase {
        constructor(opt) {
            const dopt = opt;
            super(dopt);
            if (!opt) {
                return;
            }
            this.out_sx = dopt.in_sx;
            this.out_sy = dopt.in_sy;
            this.out_depth = dopt.in_depth;
            this.layer_type = 'dropout';
            this.drop_prob = typeof dopt.drop_prob !== 'undefined' ? dopt.drop_prob : 0.5;
            const d = util.zeros(this.out_sx * this.out_sy * this.out_depth);
            this.dropped = d.map((v) => v !== 0);
        }
        forward(V, is_training) {
            this.in_act = V;
            if (typeof (is_training) === 'undefined') {
                is_training = false;
            }
            const V2 = V.clone();
            const N = V.w.length;
            if (is_training) {
                for (let i = 0; i < N; i++) {
                    if (Math.random() < this.drop_prob) {
                        V2.w[i] = 0;
                        this.dropped[i] = true;
                    }
                    else {
                        this.dropped[i] = false;
                    }
                }
            }
            else {
                for (let i = 0; i < N; i++) {
                    V2.w[i] *= this.drop_prob;
                }
            }
            this.out_act = V2;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            const chain_grad = this.out_act;
            const n = V.w.length;
            V.dw = util.zeros(n);
            for (let i = 0; i < n; i++) {
                if (!(this.dropped[i])) {
                    V.dw[i] = chain_grad.dw[i];
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
            json.drop_prob = this.drop_prob;
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.drop_prob = json.drop_prob;
            const d = util.zeros(this.out_sx * this.out_sy * this.out_depth);
            this.dropped = d.map((v) => v !== 0);
        }
    }
    exports.DropoutLayer = DropoutLayer;
});
//# sourceMappingURL=convnet_layers_dropout.js.map