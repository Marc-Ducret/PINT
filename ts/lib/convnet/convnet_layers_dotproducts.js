define(["require", "exports", "./convnet_vol", "./layers", "./convnet_util"], function (require, exports, convnet_vol_1, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DotproductsLayer extends layers_1.LayerBase {
        constructor(opt) {
            super();
            if (!opt) {
                return;
            }
            this.l1_decay_mul = typeof opt.l1_decay_mul !== 'undefined' ? opt.l1_decay_mul : 0.0;
            this.l2_decay_mul = typeof opt.l2_decay_mul !== 'undefined' ? opt.l2_decay_mul : 1.0;
        }
    }
    exports.DotproductsLayer = DotproductsLayer;
    class ConvLayer extends DotproductsLayer {
        constructor(opt) {
            const copt = opt;
            super(copt);
            if (!opt) {
                return;
            }
            this.out_depth = copt.filters;
            this.sx = copt.sx;
            this.in_depth = copt.in_depth;
            this.in_sx = copt.in_sx;
            this.in_sy = copt.in_sy;
            this.sy = typeof copt.sy !== 'undefined' ? copt.sy : this.sx;
            this.stride = typeof copt.stride !== 'undefined' ? copt.stride : 1;
            this.pad = typeof copt.pad !== 'undefined' ? copt.pad : 0;
            this.out_sx = Math.floor((this.in_sx + this.pad * 2 - this.sx) / this.stride + 1);
            this.out_sy = Math.floor((this.in_sy + this.pad * 2 - this.sy) / this.stride + 1);
            this.layer_type = 'conv';
            this.filters = [];
            for (let i = 0; i < this.out_depth; i++) {
                this.filters.push(new convnet_vol_1.Vol(this.sx, this.sy, this.in_depth));
            }
            const bias = (typeof opt.bias_pref !== 'undefined' ? opt.bias_pref : 0.0);
            this.biases = new convnet_vol_1.Vol(1, 1, this.out_depth, bias);
        }
        forward(V) {
            this.in_act = V;
            const A = new convnet_vol_1.Vol(this.out_sx | 0, this.out_sy | 0, this.out_depth | 0, 0.0);
            const V_sx = V.sx | 0;
            const V_sy = V.sy | 0;
            const xy_stride = this.stride | 0;
            for (let d = 0; d < this.out_depth; d++) {
                const f = this.filters[d];
                let x = -this.pad | 0;
                let y = -this.pad | 0;
                for (let ay = 0; ay < this.out_sy; y += xy_stride, ay++) {
                    x = -this.pad | 0;
                    for (let ax = 0; ax < this.out_sx; x += xy_stride, ax++) {
                        let a = 0.0;
                        for (let fy = 0; fy < f.sy; fy++) {
                            const oy = y + fy;
                            for (let fx = 0; fx < f.sx; fx++) {
                                const ox = x + fx;
                                if (oy >= 0 && oy < V_sy && ox >= 0 && ox < V_sx) {
                                    for (let fd = 0; fd < f.depth; fd++) {
                                        a += f.w[((f.sx * fy) + fx) * f.depth + fd] * V.w[((V_sx * oy) + ox) * V.depth + fd];
                                    }
                                }
                            }
                        }
                        a += this.biases.w[d];
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
            const V_sx = V.sx | 0;
            const V_sy = V.sy | 0;
            const xy_stride = this.stride | 0;
            for (let d = 0; d < this.out_depth; d++) {
                const f = this.filters[d];
                let x = -this.pad | 0;
                let y = -this.pad | 0;
                for (let ay = 0; ay < this.out_sy; y += xy_stride, ay++) {
                    x = -this.pad | 0;
                    for (let ax = 0; ax < this.out_sx; x += xy_stride, ax++) {
                        const chain_grad = this.out_act.get_grad(ax, ay, d);
                        for (let fy = 0; fy < f.sy; fy++) {
                            const oy = y + fy;
                            for (let fx = 0; fx < f.sx; fx++) {
                                const ox = x + fx;
                                if (oy >= 0 && oy < V_sy && ox >= 0 && ox < V_sx) {
                                    for (let fd = 0; fd < f.depth; fd++) {
                                        const ix1 = ((V_sx * oy) + ox) * V.depth + fd;
                                        const ix2 = ((f.sx * fy) + fx) * f.depth + fd;
                                        f.dw[ix2] += V.w[ix1] * chain_grad;
                                        V.dw[ix1] += f.w[ix2] * chain_grad;
                                    }
                                }
                            }
                        }
                        this.biases.dw[d] += chain_grad;
                    }
                }
            }
            return 0;
        }
        getParamsAndGrads() {
            const response = [];
            for (let i = 0; i < this.out_depth; i++) {
                response.push({ params: this.filters[i].w, grads: this.filters[i].dw, l2_decay_mul: this.l2_decay_mul, l1_decay_mul: this.l1_decay_mul });
            }
            response.push({ params: this.biases.w, grads: this.biases.dw, l1_decay_mul: 0.0, l2_decay_mul: 0.0 });
            return response;
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
            json.l1_decay_mul = this.l1_decay_mul;
            json.l2_decay_mul = this.l2_decay_mul;
            json.pad = this.pad;
            json.filters = [];
            for (let i = 0; i < this.filters.length; i++) {
                json.filters.push(this.filters[i].toJSON());
            }
            json.biases = this.biases.toJSON();
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
            this.filters = [];
            this.l1_decay_mul = (typeof json.l1_decay_mul !== 'undefined' ? json.l1_decay_mul : 1.0);
            this.l2_decay_mul = (typeof json.l2_decay_mul !== 'undefined' ? json.l2_decay_mul : 1.0);
            this.pad = (typeof json.pad !== 'undefined' ? json.pad : 0);
            for (let i = 0; i < json.filters.length; i++) {
                const v = new convnet_vol_1.Vol(0, 0, 0, 0);
                v.fromJSON(json.filters[i]);
                this.filters.push(v);
            }
            this.biases = new convnet_vol_1.Vol(0, 0, 0, 0);
            this.biases.fromJSON(json.biases);
        }
    }
    exports.ConvLayer = ConvLayer;
    class FullyConnLayer extends DotproductsLayer {
        constructor(opt) {
            const fcopt = opt;
            super(fcopt);
            if (!opt) {
                return;
            }
            this.out_depth = typeof fcopt.num_neurons !== 'undefined' ? fcopt.num_neurons : fcopt.filters;
            this.num_inputs = fcopt.in_sx * fcopt.in_sy * fcopt.in_depth;
            this.out_sx = 1;
            this.out_sy = 1;
            this.layer_type = 'fc';
            this.filters = [];
            for (let i = 0; i < this.out_depth; i++) {
                this.filters.push(new convnet_vol_1.Vol(1, 1, this.num_inputs));
            }
            const bias = (typeof opt.bias_pref !== 'undefined' ? opt.bias_pref : 0.0);
            this.biases = new convnet_vol_1.Vol(1, 1, this.out_depth, bias);
        }
        forward(V) {
            this.in_act = V;
            const A = new convnet_vol_1.Vol(1, 1, this.out_depth, 0.0);
            const Vw = V.w;
            for (let i = 0; i < this.out_depth; i++) {
                let a = 0.0;
                const wi = this.filters[i].w;
                for (let d = 0; d < this.num_inputs; d++) {
                    a += Vw[d] * wi[d];
                }
                a += this.biases.w[i];
                A.w[i] = a;
            }
            this.out_act = A;
            return this.out_act;
        }
        backward() {
            const V = this.in_act;
            V.dw = util.zeros(V.w.length);
            for (let i = 0; i < this.out_depth; i++) {
                const tfi = this.filters[i];
                const chain_grad = this.out_act.dw[i];
                for (let d = 0; d < this.num_inputs; d++) {
                    V.dw[d] += tfi.w[d] * chain_grad;
                    tfi.dw[d] += V.w[d] * chain_grad;
                }
                this.biases.dw[i] += chain_grad;
            }
        }
        getParamsAndGrads() {
            const response = [];
            for (let i = 0; i < this.out_depth; i++) {
                response.push({ params: this.filters[i].w, grads: this.filters[i].dw, l1_decay_mul: this.l1_decay_mul, l2_decay_mul: this.l2_decay_mul });
            }
            response.push({ params: this.biases.w, grads: this.biases.dw, l1_decay_mul: 0.0, l2_decay_mul: 0.0 });
            return response;
        }
        toJSON() {
            const json = {};
            json.out_depth = this.out_depth;
            json.out_sx = this.out_sx;
            json.out_sy = this.out_sy;
            json.layer_type = this.layer_type;
            json.num_inputs = this.num_inputs;
            json.l1_decay_mul = this.l1_decay_mul;
            json.l2_decay_mul = this.l2_decay_mul;
            json.filters = [];
            for (let i = 0; i < this.filters.length; i++) {
                json.filters.push(this.filters[i].toJSON());
            }
            json.biases = this.biases.toJSON();
            return json;
        }
        fromJSON(json) {
            this.out_depth = json.out_depth;
            this.out_sx = json.out_sx;
            this.out_sy = json.out_sy;
            this.layer_type = json.layer_type;
            this.num_inputs = json.num_inputs;
            this.l1_decay_mul = (typeof json.l1_decay_mul !== 'undefined' ? json.l1_decay_mul : 1.0);
            this.l2_decay_mul = (typeof json.l2_decay_mul !== 'undefined' ? json.l2_decay_mul : 1.0);
            this.filters = [];
            for (let i = 0; i < json.filters.length; i++) {
                const v = new convnet_vol_1.Vol(0, 0, 0, 0);
                v.fromJSON(json.filters[i]);
                this.filters.push(v);
            }
            this.biases = new convnet_vol_1.Vol(0, 0, 0, 0);
            this.biases.fromJSON(json.biases);
        }
    }
    exports.FullyConnLayer = FullyConnLayer;
});
//# sourceMappingURL=convnet_layers_dotproducts.js.map