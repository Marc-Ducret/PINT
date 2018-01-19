define("cnnutil", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Window {
        constructor(size, minsize) {
            this.v = [];
            this.size = typeof (size) === 'undefined' ? 100 : size;
            this.minsize = typeof (minsize) === 'undefined' ? 20 : minsize;
            this.sum = 0;
        }
        add(x) {
            this.v.push(x);
            this.sum += x;
            if (this.v.length > this.size) {
                const xold = this.v.shift();
                this.sum -= xold;
            }
        }
        get_average() {
            if (this.v.length < this.minsize) {
                return -1;
            }
            else {
                return this.sum / this.v.length;
            }
        }
        reset() {
            this.v = [];
            this.sum = 0;
        }
    }
    exports.Window = Window;
    function maxmin(w) {
        if (w.length === 0) {
            return {};
        }
        let maxv = w[0];
        let minv = w[0];
        let maxi = 0;
        let mini = 0;
        for (let i = 1; i < w.length; i++) {
            if (w[i] > maxv) {
                maxv = w[i];
                maxi = i;
            }
            if (w[i] < minv) {
                minv = w[i];
                mini = i;
            }
        }
        return { maxi: maxi, maxv: maxv, mini: mini, minv: minv, dv: maxv - minv };
    }
    exports.maxmin = maxmin;
    function f2t(x, d) {
        if (typeof (d) === 'undefined') {
            d = 5;
        }
        const dd = 1.0 * Math.pow(10, d);
        return '' + Math.floor(x * dd) / dd;
    }
    exports.f2t = f2t;
});
define("cnnvis", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Graph {
        constructor(options) {
            if (!options) {
                options = {};
            }
            this.step_horizon = options.step_horizon || 1000;
            this.pts = [];
            this.maxy = -9999;
            this.miny = 9999;
        }
        add(step, y) {
            let time = new Date().getTime();
            if (y > this.maxy * 0.99) {
                this.maxy = y * 1.05;
            }
            if (y < this.miny * 1.01) {
                this.miny = y * 0.95;
            }
            this.pts.push({ step: step, time: time, y: y });
            if (step > this.step_horizon) {
                this.step_horizon *= 2;
            }
        }
        drawSelf(canv) {
            let pad = 25;
            let H = canv.height;
            let W = canv.width;
            let ctx = canv.getContext('2d');
            ctx.clearRect(0, 0, W, H);
            ctx.font = "10px Georgia";
            let f2t = function (x) {
                let dd = 1.0 * Math.pow(10, 2);
                return '' + Math.floor(x * dd) / dd;
            };
            ctx.strokeStyle = "#999";
            ctx.beginPath();
            let ng = 10;
            for (let i = 0; i <= ng; i++) {
                let xpos = i / ng * (W - 2 * pad) + pad;
                ctx.moveTo(xpos, pad);
                ctx.lineTo(xpos, H - pad);
                ctx.fillText(f2t(i / ng * this.step_horizon / 1000) + 'k', xpos, H - pad + 14);
            }
            for (let i = 0; i <= ng; i++) {
                let ypos = i / ng * (H - 2 * pad) + pad;
                ctx.moveTo(pad, ypos);
                ctx.lineTo(W - pad, ypos);
                ctx.fillText(f2t((ng - i) / ng * (this.maxy - this.miny) + this.miny), 0, ypos);
            }
            ctx.stroke();
            let N = this.pts.length;
            if (N < 2) {
                return;
            }
            let t = function (x, y, s) {
                let tx = x / s.step_horizon * (W - pad * 2) + pad;
                let ty = H - ((y - s.miny) / (s.maxy - s.miny) * (H - pad * 2) + pad);
                return { tx: tx, ty: ty };
            };
            ctx.strokeStyle = "red";
            ctx.beginPath();
            for (let i = 0; i < N; i++) {
                let p = this.pts[i];
                let pt = t(p.step, p.y, this);
                if (i === 0) {
                    ctx.moveTo(pt.tx, pt.ty);
                }
                else {
                    ctx.lineTo(pt.tx, pt.ty);
                }
            }
            ctx.stroke();
        }
    }
    exports.Graph = Graph;
    class MultiGraph {
        constructor(legend, options) {
            if (!options) {
                options = {};
            }
            this.step_horizon = options.step_horizon || 1000;
            if (typeof options.maxy !== 'undefined') {
                this.maxy_forced = options.maxy;
            }
            if (typeof options.miny !== 'undefined') {
                this.miny_forced = options.miny;
            }
            this.pts = [];
            this.maxy = -9999;
            this.miny = 9999;
            this.numlines = 0;
            this.numlines = legend.length;
            this.legend = legend;
            this.styles = ["red", "blue", "green", "black", "magenta", "cyan", "purple", "aqua", "olive", "lime", "navy"];
        }
        add(step, yl) {
            let time = new Date().getTime();
            let n = yl.length;
            for (let k = 0; k < n; k++) {
                let y = yl[k];
                if (y > this.maxy * 0.99) {
                    this.maxy = y * 1.05;
                }
                ;
                if (y < this.miny * 1.01) {
                    this.miny = y * 0.95;
                }
                ;
            }
            if (typeof this.maxy_forced !== 'undefined') {
                this.maxy = this.maxy_forced;
            }
            ;
            if (typeof this.miny_forced !== 'undefined') {
                this.miny = this.miny_forced;
            }
            ;
            this.pts.push({ step: step, time: time, yl: yl });
            if (step > this.step_horizon) {
                this.step_horizon *= 2;
            }
            ;
        }
        drawSelf(canv) {
            let pad = 25;
            let H = canv.height;
            let W = canv.width;
            let ctx = canv.getContext('2d');
            ctx.clearRect(0, 0, W, H);
            ctx.font = "10px Georgia";
            let f2t = function (x) {
                let dd = 1.0 * Math.pow(10, 2);
                return '' + Math.floor(x * dd) / dd;
            };
            ctx.strokeStyle = "#999";
            ctx.beginPath();
            let ng = 10;
            for (let i = 0; i <= ng; i++) {
                let xpos = i / ng * (W - 2 * pad) + pad;
                ctx.moveTo(xpos, pad);
                ctx.lineTo(xpos, H - pad);
                ctx.fillText(f2t(i / ng * this.step_horizon / 1000) + 'k', xpos, H - pad + 14);
            }
            for (let i = 0; i <= ng; i++) {
                let ypos = i / ng * (H - 2 * pad) + pad;
                ctx.moveTo(pad, ypos);
                ctx.lineTo(W - pad, ypos);
                ctx.fillText(f2t((ng - i) / ng * (this.maxy - this.miny) + this.miny), 0, ypos);
            }
            ctx.stroke();
            let N = this.pts.length;
            if (N < 2) {
                return;
            }
            for (let k = 0; k < this.numlines; k++) {
                ctx.fillStyle = this.styles[k % this.styles.length];
                ctx.fillText(this.legend[k], W - pad - 100, pad + 20 + k * 16);
            }
            ctx.fillStyle = "black";
            let t = function (x, y, s) {
                let tx = x / s.step_horizon * (W - pad * 2) + pad;
                let ty = H - ((y - s.miny) / (s.maxy - s.miny) * (H - pad * 2) + pad);
                return { tx: tx, ty: ty };
            };
            for (let k = 0; k < this.numlines; k++) {
                ctx.strokeStyle = this.styles[k % this.styles.length];
                ctx.beginPath();
                for (let i = 0; i < N; i++) {
                    let p = this.pts[i];
                    let pt = t(p.step, p.yl[k], this);
                    if (i === 0) {
                        ctx.moveTo(pt.tx, pt.ty);
                    }
                    else {
                        ctx.lineTo(pt.tx, pt.ty);
                    }
                }
                ctx.stroke();
            }
        }
    }
    exports.MultiGraph = MultiGraph;
});
define("convnet_util", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let return_v = false;
    let v_val = 0.0;
    function gaussRandom() {
        if (return_v) {
            return_v = false;
            return v_val;
        }
        const u = 2 * Math.random() - 1;
        const v = 2 * Math.random() - 1;
        const r = u * u + v * v;
        if (r === 0 || r > 1) {
            return gaussRandom();
        }
        const c = Math.sqrt(-2 * Math.log(r) / r);
        v_val = v * c;
        return_v = true;
        return u * c;
    }
    exports.gaussRandom = gaussRandom;
    function randf(a, b) { return Math.random() * (b - a) + a; }
    exports.randf = randf;
    function randi(a, b) { return Math.floor(Math.random() * (b - a) + a); }
    exports.randi = randi;
    function randn(mu, std) { return mu + gaussRandom() * std; }
    exports.randn = randn;
    function zeros(n) {
        if (typeof (n) === 'undefined' || isNaN(n)) {
            return [];
        }
        if (typeof ArrayBuffer === 'undefined') {
            const arr = new Array(n);
            for (let i = 0; i < n; i++) {
                arr[i] = 0;
            }
            return arr;
        }
        else {
            return new Float64Array(n);
        }
    }
    exports.zeros = zeros;
    function arrContains(arr, elt) {
        for (let i = 0, n = arr.length; i < n; i++) {
            if (arr[i] === elt) {
                return true;
            }
        }
        return false;
    }
    exports.arrContains = arrContains;
    function arrUnique(arr) {
        const b = [];
        for (let i = 0, n = arr.length; i < n; i++) {
            if (!arrContains(b, arr[i])) {
                b.push(arr[i]);
            }
        }
        return b;
    }
    exports.arrUnique = arrUnique;
    function maxmin(w) {
        if (w.length === 0) {
            return {};
        }
        let maxv = w[0];
        let minv = w[0];
        let maxi = 0;
        let mini = 0;
        const n = w.length;
        for (let i = 1; i < n; i++) {
            if (w[i] > maxv) {
                maxv = w[i];
                maxi = i;
            }
            if (w[i] < minv) {
                minv = w[i];
                mini = i;
            }
        }
        return { maxi: maxi, maxv: maxv, mini: mini, minv: minv, dv: maxv - minv };
    }
    exports.maxmin = maxmin;
    function randperm(n) {
        let i = n, j = 0, temp;
        const array = [];
        for (let q = 0; q < n; q++) {
            array[q] = q;
        }
        while (i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    exports.randperm = randperm;
    function weightedSample(lst, probs) {
        const p = randf(0, 1.0);
        let cumprob = 0.0;
        for (let k = 0, n = lst.length; k < n; k++) {
            cumprob += probs[k];
            if (p < cumprob) {
                return lst[k];
            }
        }
    }
    exports.weightedSample = weightedSample;
    function getopt(opt, field_name, default_value) {
        if (typeof field_name === 'string') {
            const ret = (typeof opt[field_name] !== 'undefined') ? opt[field_name] : default_value;
            return Number(ret);
        }
        else {
            let ret = default_value;
            for (let i = 0; i < field_name.length; i++) {
                const f = field_name[i];
                if (typeof opt[f] !== 'undefined') {
                    ret = Number(opt[f]);
                }
            }
            return ret;
        }
    }
    exports.getopt = getopt;
    function assert(condition, message) {
        if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message;
        }
    }
    exports.assert = assert;
});
define("convnet_vol", ["require", "exports", "convnet_util"], function (require, exports, util) {
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
define("layers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LayerBase {
        constructor(opt) {
            if (!opt) {
                return;
            }
        }
    }
    exports.LayerBase = LayerBase;
});
define("convnet_layers_dotproducts", ["require", "exports", "convnet_vol", "layers", "convnet_util"], function (require, exports, convnet_vol_1, layers_1, util) {
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
define("convnet_layers_dropout", ["require", "exports", "layers", "convnet_util"], function (require, exports, layers_2, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DropoutLayer extends layers_2.LayerBase {
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
define("convnet_layers_input", ["require", "exports", "layers", "convnet_util"], function (require, exports, layers_3, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const getopt = util.getopt;
    class InputLayer extends layers_3.LayerBase {
        constructor(opt) {
            super(opt);
            if (!opt) {
                return;
            }
            this.out_depth = getopt(opt, ['out_depth', 'depth'], 0);
            this.out_sx = getopt(opt, ['out_sx', 'sx', 'width'], 1);
            this.out_sy = getopt(opt, ['out_sy', 'sy', 'height'], 1);
            this.layer_type = 'input';
        }
        forward(V) {
            this.in_act = V;
            this.out_act = V;
            return this.out_act;
        }
        backward() { }
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
    exports.InputLayer = InputLayer;
});
define("convnet_layers_loss", ["require", "exports", "convnet_vol", "layers", "convnet_util"], function (require, exports, convnet_vol_2, layers_4, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SoftmaxLayer extends layers_4.LayerBase {
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
            const A = new convnet_vol_2.Vol(1, 1, this.out_depth, 0.0);
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
    class RegressionLayer extends layers_4.LayerBase {
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
    class SVMLayer extends layers_4.LayerBase {
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
define("convnet_layers_nonlinearities", ["require", "exports", "convnet_vol", "layers", "convnet_util"], function (require, exports, convnet_vol_3, layers_5, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OutputLayer extends layers_5.LayerBase {
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
            const V2 = new convnet_vol_3.Vol(this.out_sx, this.out_sy, this.out_depth, 0.0);
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
define("convnet_layers_normalization", ["require", "exports", "layers", "convnet_util"], function (require, exports, layers_6, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LocalResponseNormalizationLayer extends layers_6.LayerBase {
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
define("convnet_layers_pool", ["require", "exports", "convnet_vol", "layers", "convnet_util"], function (require, exports, convnet_vol_4, layers_7, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PoolLayer extends layers_7.LayerBase {
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
            const A = new convnet_vol_4.Vol(this.out_sx, this.out_sy, this.out_depth, 0.0);
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
define("convnet_net", ["require", "exports", "convnet_util", "convnet_layers_loss", "convnet_layers_dotproducts", "convnet_layers_nonlinearities", "convnet_layers_pool", "convnet_layers_input", "convnet_layers_dropout", "convnet_layers_normalization"], function (require, exports, util, convnet_layers_loss_1, convnet_layers_dotproducts_1, convnet_layers_nonlinearities_1, convnet_layers_pool_1, convnet_layers_input_1, convnet_layers_dropout_1, convnet_layers_normalization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const assert = util.assert;
    class Net {
        constructor(options) {
            if (!options) {
                options = [];
            }
            this.layers = [];
        }
        makeLayers(defs) {
            assert(defs.length >= 2, 'Error! At least one input layer and one loss layer are required.');
            assert(defs[0].type === 'input', 'Error! First layer must be the input layer, to declare size of inputs');
            const desugar = function (defs) {
                const new_defs = new Array();
                for (let i = 0; i < defs.length; i++) {
                    const def = defs[i];
                    if (def.type === 'softmax' || def.type === 'svm') {
                        const lossDef = def;
                        new_defs.push({ type: 'fc', num_neurons: lossDef.num_classes });
                    }
                    if (def.type === 'regression') {
                        new_defs.push({ type: 'fc', num_neurons: def.num_neurons });
                    }
                    if (def.type === 'fc' || def.type === 'conv') {
                        const dotDef = def;
                        if (typeof (dotDef.bias_pref) === 'undefined') {
                            dotDef.bias_pref = 0.0;
                            if (typeof dotDef.activation !== 'undefined' && dotDef.activation === 'relu') {
                                dotDef.bias_pref = 0.1;
                            }
                        }
                    }
                    new_defs.push(def);
                    if (typeof def.activation !== 'undefined') {
                        if (def.activation === 'relu') {
                            new_defs.push({ type: 'relu' });
                        }
                        else if (def.activation === 'sigmoid') {
                            new_defs.push({ type: 'sigmoid' });
                        }
                        else if (def.activation === 'tanh') {
                            new_defs.push({ type: 'tanh' });
                        }
                        else if (def.activation === 'maxout') {
                            const gs = def.group_size !== 'undefined' ? def.group_size : 2;
                            new_defs.push({ type: 'maxout', group_size: gs });
                        }
                        else {
                            console.log('ERROR unsupported activation ' + def.activation);
                        }
                    }
                    if (typeof def.drop_prob !== 'undefined' && def.type !== 'dropout') {
                        new_defs.push({ type: 'dropout', drop_prob: def.drop_prob });
                    }
                }
                return new_defs;
            };
            defs = desugar(defs);
            this.layers = [];
            for (let i = 0; i < defs.length; i++) {
                const def = defs[i];
                if (i > 0) {
                    const prev = this.layers[i - 1];
                    def.in_sx = prev.out_sx;
                    def.in_sy = prev.out_sy;
                    def.in_depth = prev.out_depth;
                }
                switch (def.type) {
                    case 'fc':
                        this.layers.push(new convnet_layers_dotproducts_1.FullyConnLayer(def));
                        break;
                    case 'lrn':
                        this.layers.push(new convnet_layers_normalization_1.LocalResponseNormalizationLayer(def));
                        break;
                    case 'dropout':
                        this.layers.push(new convnet_layers_dropout_1.DropoutLayer(def));
                        break;
                    case 'input':
                        this.layers.push(new convnet_layers_input_1.InputLayer(def));
                        break;
                    case 'softmax':
                        this.layers.push(new convnet_layers_loss_1.SoftmaxLayer(def));
                        break;
                    case 'regression':
                        this.layers.push(new convnet_layers_loss_1.RegressionLayer(def));
                        break;
                    case 'conv':
                        this.layers.push(new convnet_layers_dotproducts_1.ConvLayer(def));
                        break;
                    case 'pool':
                        this.layers.push(new convnet_layers_pool_1.PoolLayer(def));
                        break;
                    case 'relu':
                        this.layers.push(new convnet_layers_nonlinearities_1.ReluLayer(def));
                        break;
                    case 'sigmoid':
                        this.layers.push(new convnet_layers_nonlinearities_1.SigmoidLayer(def));
                        break;
                    case 'tanh':
                        this.layers.push(new convnet_layers_nonlinearities_1.TanhLayer(def));
                        break;
                    case 'maxout':
                        this.layers.push(new convnet_layers_nonlinearities_1.MaxoutLayer(def));
                        break;
                    case 'svm':
                        this.layers.push(new convnet_layers_loss_1.SVMLayer(def));
                        break;
                    default: console.log('ERROR: UNRECOGNIZED LAYER TYPE: ' + def.type);
                }
            }
        }
        forward(V, is_training) {
            if (typeof (is_training) === 'undefined') {
                is_training = false;
            }
            let act = this.layers[0].forward(V, is_training);
            for (let i = 1; i < this.layers.length; i++) {
                act = this.layers[i].forward(act, is_training);
            }
            return act;
        }
        getCostLoss(V, y) {
            this.forward(V, false);
            const N = this.layers.length;
            const loss = this.layers[N - 1].backward(y);
            return loss;
        }
        backward(y) {
            const N = this.layers.length;
            const loss = this.layers[N - 1].backward(y);
            for (let i = N - 2; i >= 0; i--) {
                this.layers[i].backward();
            }
            return loss;
        }
        getParamsAndGrads() {
            const response = [];
            for (let i = 0; i < this.layers.length; i++) {
                const layer_reponse = this.layers[i].getParamsAndGrads();
                for (let j = 0; j < layer_reponse.length; j++) {
                    response.push(layer_reponse[j]);
                }
            }
            return response;
        }
        getPrediction() {
            const S = this.layers[this.layers.length - 1];
            assert(S.layer_type === 'softmax', 'getPrediction function assumes softmax as last layer of the net!');
            if (S instanceof convnet_layers_loss_1.SoftmaxLayer) {
                const p = S.out_act.w;
                let maxv = p[0];
                let maxi = 0;
                for (let i = 1; i < p.length; i++) {
                    if (p[i] > maxv) {
                        maxv = p[i];
                        maxi = i;
                    }
                }
                return maxi;
            }
            throw Error("to getPrediction, the last layer must be softmax");
        }
        toJSON() {
            const json = {};
            json.layers = [];
            for (let i = 0; i < this.layers.length; i++) {
                json.layers.push(this.layers[i].toJSON());
            }
            return json;
        }
        fromJSON(json) {
            this.layers = [];
            for (let i = 0; i < json.layers.length; i++) {
                const Lj = json.layers[i];
                const t = Lj.layer_type;
                let L;
                if (t === 'input') {
                    L = new convnet_layers_input_1.InputLayer();
                }
                if (t === 'relu') {
                    L = new convnet_layers_nonlinearities_1.ReluLayer();
                }
                if (t === 'sigmoid') {
                    L = new convnet_layers_nonlinearities_1.SigmoidLayer();
                }
                if (t === 'tanh') {
                    L = new convnet_layers_nonlinearities_1.TanhLayer();
                }
                if (t === 'dropout') {
                    L = new convnet_layers_dropout_1.DropoutLayer();
                }
                if (t === 'conv') {
                    L = new convnet_layers_dotproducts_1.ConvLayer();
                }
                if (t === 'pool') {
                    L = new convnet_layers_pool_1.PoolLayer();
                }
                if (t === 'lrn') {
                    L = new convnet_layers_normalization_1.LocalResponseNormalizationLayer();
                }
                if (t === 'softmax') {
                    L = new convnet_layers_loss_1.SoftmaxLayer();
                }
                if (t === 'regression') {
                    L = new convnet_layers_loss_1.RegressionLayer();
                }
                if (t === 'fc') {
                    L = new convnet_layers_dotproducts_1.FullyConnLayer();
                }
                if (t === 'maxout') {
                    L = new convnet_layers_nonlinearities_1.MaxoutLayer();
                }
                if (t === 'svm') {
                    L = new convnet_layers_loss_1.SVMLayer();
                }
                L.fromJSON(Lj);
                this.layers.push(L);
            }
        }
    }
    exports.Net = Net;
});
define("convnet_trainers", ["require", "exports", "convnet_util"], function (require, exports, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Trainer {
        constructor(net, options) {
            this.net = net;
            if (!options) {
                options = {};
            }
            this.learning_rate = typeof options.learning_rate !== 'undefined' ? options.learning_rate : 0.01;
            this.l1_decay = typeof options.l1_decay !== 'undefined' ? options.l1_decay : 0.0;
            this.l2_decay = typeof options.l2_decay !== 'undefined' ? options.l2_decay : 0.0;
            this.batch_size = typeof options.batch_size !== 'undefined' ? options.batch_size : 1;
            this.method = typeof options.method !== 'undefined' ? options.method : 'sgd';
            this.momentum = typeof options.momentum !== 'undefined' ? options.momentum : 0.9;
            this.ro = typeof options.ro !== 'undefined' ? options.ro : 0.95;
            this.eps = typeof options.eps !== 'undefined' ? options.eps : 1e-8;
            this.beta1 = typeof options.beta1 !== 'undefined' ? options.beta1 : 0.9;
            this.beta2 = typeof options.beta2 !== 'undefined' ? options.beta2 : 0.999;
            this.k = 0;
            this.gsum = [];
            this.xsum = [];
            if (this.net.layers[this.net.layers.length - 1].layer_type === "regression") {
                this.regression = true;
            }
            else {
                this.regression = false;
            }
        }
        train(x, y) {
            let start = new Date().getTime();
            this.net.forward(x, true);
            let end = new Date().getTime();
            const fwd_time = end - start;
            start = new Date().getTime();
            const cost_loss = this.net.backward(y);
            let l2_decay_loss = 0.0;
            let l1_decay_loss = 0.0;
            end = new Date().getTime();
            const bwd_time = end - start;
            if (this.regression && y.constructor !== Array) {
            }
            this.k++;
            if (this.k % this.batch_size === 0) {
                const pglist = this.net.getParamsAndGrads();
                if (this.gsum.length === 0 && (this.method !== 'sgd' || this.momentum > 0.0)) {
                    for (let i = 0; i < pglist.length; i++) {
                        this.gsum.push(util.zeros(pglist[i].params.length));
                        if (this.method === 'adam' || this.method === 'adadelta') {
                            this.xsum.push(util.zeros(pglist[i].params.length));
                        }
                        else {
                            this.xsum.push([]);
                        }
                    }
                }
                for (let i = 0; i < pglist.length; i++) {
                    const pg = pglist[i];
                    const p = pg.params;
                    const g = pg.grads;
                    const l2_decay_mul = typeof pg.l2_decay_mul !== 'undefined' ? pg.l2_decay_mul : 1.0;
                    const l1_decay_mul = typeof pg.l1_decay_mul !== 'undefined' ? pg.l1_decay_mul : 1.0;
                    const l2_decay = this.l2_decay * l2_decay_mul;
                    const l1_decay = this.l1_decay * l1_decay_mul;
                    const plen = p.length;
                    for (let j = 0; j < plen; j++) {
                        l2_decay_loss += l2_decay * p[j] * p[j] / 2;
                        l1_decay_loss += l1_decay * Math.abs(p[j]);
                        const l1grad = l1_decay * (p[j] > 0 ? 1 : -1);
                        const l2grad = l2_decay * (p[j]);
                        const gij = (l2grad + l1grad + g[j]) / this.batch_size;
                        const gsumi = this.gsum[i];
                        const xsumi = this.xsum[i];
                        if (this.method === 'adam') {
                            gsumi[j] = gsumi[j] * this.beta1 + (1 - this.beta1) * gij;
                            xsumi[j] = xsumi[j] * this.beta2 + (1 - this.beta2) * gij * gij;
                            const biasCorr1 = gsumi[j] * (1 - Math.pow(this.beta1, this.k));
                            const biasCorr2 = xsumi[j] * (1 - Math.pow(this.beta2, this.k));
                            const dx = -this.learning_rate * biasCorr1 / (Math.sqrt(biasCorr2) + this.eps);
                            p[j] += dx;
                        }
                        else if (this.method === 'adagrad') {
                            gsumi[j] = gsumi[j] + gij * gij;
                            const dx = -this.learning_rate / Math.sqrt(gsumi[j] + this.eps) * gij;
                            p[j] += dx;
                        }
                        else if (this.method === 'windowgrad') {
                            gsumi[j] = this.ro * gsumi[j] + (1 - this.ro) * gij * gij;
                            const dx = -this.learning_rate / Math.sqrt(gsumi[j] + this.eps) * gij;
                            p[j] += dx;
                        }
                        else if (this.method === 'adadelta') {
                            gsumi[j] = this.ro * gsumi[j] + (1 - this.ro) * gij * gij;
                            const dx = -Math.sqrt((xsumi[j] + this.eps) / (gsumi[j] + this.eps)) * gij;
                            xsumi[j] = this.ro * xsumi[j] + (1 - this.ro) * dx * dx;
                            p[j] += dx;
                        }
                        else if (this.method === 'nesterov') {
                            let dx = gsumi[j];
                            gsumi[j] = gsumi[j] * this.momentum + this.learning_rate * gij;
                            dx = this.momentum * dx - (1.0 + this.momentum) * gsumi[j];
                            p[j] += dx;
                        }
                        else {
                            if (this.momentum > 0.0) {
                                const dx = this.momentum * gsumi[j] - this.learning_rate * gij;
                                gsumi[j] = dx;
                                p[j] += dx;
                            }
                            else {
                                p[j] += -this.learning_rate * gij;
                            }
                        }
                        g[j] = 0.0;
                    }
                }
            }
            return {
                fwd_time: fwd_time, bwd_time: bwd_time,
                l2_decay_loss: l2_decay_loss, l1_decay_loss: l1_decay_loss,
                cost_loss: cost_loss, softmax_loss: cost_loss,
                loss: cost_loss + l1_decay_loss + l2_decay_loss
            };
        }
    }
    exports.Trainer = Trainer;
});
define("convnet_magicnet", ["require", "exports", "convnet_util", "convnet_net", "convnet_trainers"], function (require, exports, util, convnet_net_1, convnet_trainers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const randf = util.randf;
    const randi = util.randi;
    const maxmin = util.maxmin;
    const randperm = util.randperm;
    const weightedSample = util.weightedSample;
    const getopt = util.getopt;
    const arrUnique = util.arrUnique;
    class MagicNet {
        constructor(data, labels, opt) {
            if (!opt) {
                opt = {};
            }
            if (typeof data === 'undefined') {
                data = [];
            }
            if (typeof labels === 'undefined') {
                labels = [];
            }
            this.data = data;
            this.labels = labels;
            this.train_ratio = getopt(opt, 'train_ratio', 0.7);
            this.num_folds = getopt(opt, 'num_folds', 10);
            this.num_candidates = getopt(opt, 'num_candidates', 50);
            this.num_epochs = getopt(opt, 'num_epochs', 50);
            this.ensemble_size = getopt(opt, 'ensemble_size', 10);
            this.batch_size_min = getopt(opt, 'batch_size_min', 10);
            this.batch_size_max = getopt(opt, 'batch_size_max', 300);
            this.l2_decay_min = getopt(opt, 'l2_decay_min', -4);
            this.l2_decay_max = getopt(opt, 'l2_decay_max', 2);
            this.learning_rate_min = getopt(opt, 'learning_rate_min', -4);
            this.learning_rate_max = getopt(opt, 'learning_rate_max', 0);
            this.momentum_min = getopt(opt, 'momentum_min', 0.9);
            this.momentum_max = getopt(opt, 'momentum_max', 0.9);
            this.neurons_min = getopt(opt, 'neurons_min', 5);
            this.neurons_max = getopt(opt, 'neurons_max', 30);
            this.folds = [];
            this.candidates = [];
            this.evaluated_candidates = [];
            this.unique_labels = arrUnique(labels);
            this.iter = 0;
            this.foldix = 0;
            this.finish_fold_callback = null;
            this.finish_batch_callback = null;
            if (this.data.length > 0) {
                this.sampleFolds();
                this.sampleCandidates();
            }
        }
        ;
        sampleFolds() {
            const N = this.data.length;
            const num_train = Math.floor(this.train_ratio * N);
            this.folds = [];
            for (let i = 0; i < this.num_folds; i++) {
                const p = randperm(N);
                this.folds.push({ train_ix: p.slice(0, num_train), test_ix: p.slice(num_train, N) });
            }
        }
        sampleCandidate() {
            const input_depth = this.data[0].w.length;
            const num_classes = this.unique_labels.length;
            const layer_defs = [];
            layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: input_depth });
            const nl = weightedSample([0, 1, 2, 3], [0.2, 0.3, 0.3, 0.2]);
            for (let q = 0; q < nl; q++) {
                const ni = randi(this.neurons_min, this.neurons_max);
                const act = ['tanh', 'maxout', 'relu'][randi(0, 3)];
                if (randf(0, 1) < 0.5) {
                    const dp = Math.random();
                    layer_defs.push({ type: 'fc', num_neurons: ni, activation: act, drop_prob: dp });
                }
                else {
                    layer_defs.push({ type: 'fc', num_neurons: ni, activation: act });
                }
            }
            layer_defs.push({ type: 'softmax', num_classes: num_classes });
            const net = new convnet_net_1.Net();
            net.makeLayers(layer_defs);
            const bs = randi(this.batch_size_min, this.batch_size_max);
            const l2 = Math.pow(10, randf(this.l2_decay_min, this.l2_decay_max));
            const lr = Math.pow(10, randf(this.learning_rate_min, this.learning_rate_max));
            const mom = randf(this.momentum_min, this.momentum_max);
            const tp = randf(0, 1);
            let trainer_def;
            if (tp < 0.33) {
                trainer_def = { method: 'adadelta', batch_size: bs, l2_decay: l2 };
            }
            else if (tp < 0.66) {
                trainer_def = { method: 'adagrad', learning_rate: lr, batch_size: bs, l2_decay: l2 };
            }
            else {
                trainer_def = { method: 'sgd', learning_rate: lr, momentum: mom, batch_size: bs, l2_decay: l2 };
            }
            const trainer = new convnet_trainers_1.Trainer(net, trainer_def);
            const cand = {};
            cand.acc = [];
            cand.accv = 0;
            cand.layer_defs = layer_defs;
            cand.trainer_def = trainer_def;
            cand.net = net;
            cand.trainer = trainer;
            return cand;
        }
        sampleCandidates() {
            this.candidates = [];
            for (let i = 0; i < this.num_candidates; i++) {
                const cand = this.sampleCandidate();
                this.candidates.push(cand);
            }
        }
        step() {
            this.iter++;
            const fold = this.folds[this.foldix];
            const dataix = fold.train_ix[randi(0, fold.train_ix.length)];
            for (let k = 0; k < this.candidates.length; k++) {
                const x = this.data[dataix];
                const l = this.labels[dataix];
                this.candidates[k].trainer.train(x, l);
            }
            const lastiter = this.num_epochs * fold.train_ix.length;
            if (this.iter >= lastiter) {
                const val_acc = this.evalValErrors();
                for (let k = 0; k < this.candidates.length; k++) {
                    const c = this.candidates[k];
                    c.acc.push(val_acc[k]);
                    c.accv += val_acc[k];
                }
                this.iter = 0;
                this.foldix++;
                if (this.finish_fold_callback !== null) {
                    this.finish_fold_callback();
                }
                if (this.foldix >= this.folds.length) {
                    for (let k = 0; k < this.candidates.length; k++) {
                        this.evaluated_candidates.push(this.candidates[k]);
                    }
                    this.evaluated_candidates.sort(function (a, b) {
                        return (a.accv / a.acc.length)
                            > (b.accv / b.acc.length)
                            ? -1 : 1;
                    });
                    if (this.evaluated_candidates.length > 3 * this.ensemble_size) {
                        this.evaluated_candidates = this.evaluated_candidates.slice(0, 3 * this.ensemble_size);
                    }
                    if (this.finish_batch_callback !== null) {
                        this.finish_batch_callback();
                    }
                    this.sampleCandidates();
                    this.foldix = 0;
                }
                else {
                    for (let k = 0; k < this.candidates.length; k++) {
                        const c = this.candidates[k];
                        const net = new convnet_net_1.Net();
                        net.makeLayers(c.layer_defs);
                        const trainer = new convnet_trainers_1.Trainer(net, c.trainer_def);
                        c.net = net;
                        c.trainer = trainer;
                    }
                }
            }
        }
        evalValErrors() {
            const vals = [];
            const fold = this.folds[this.foldix];
            for (let k = 0; k < this.candidates.length; k++) {
                const net = this.candidates[k].net;
                let v = 0.0;
                for (let q = 0; q < fold.test_ix.length; q++) {
                    const x = this.data[fold.test_ix[q]];
                    const l = this.labels[fold.test_ix[q]];
                    net.forward(x);
                    const yhat = net.getPrediction();
                    v += (yhat === l ? 1.0 : 0.0);
                }
                v /= fold.test_ix.length;
                vals.push(v);
            }
            return vals;
        }
        predict_soft(data) {
            let eval_candidates = [];
            let nv = 0;
            if (this.evaluated_candidates.length === 0) {
                nv = this.candidates.length;
                eval_candidates = this.candidates;
            }
            else {
                nv = Math.min(this.ensemble_size, this.evaluated_candidates.length);
                eval_candidates = this.evaluated_candidates;
            }
            let xout, n;
            for (let j = 0; j < nv; j++) {
                const net = eval_candidates[j].net;
                const x = net.forward(data);
                if (j === 0) {
                    xout = x;
                    n = x.w.length;
                }
                else {
                    for (let d = 0; d < n; d++) {
                        xout.w[d] += x.w[d];
                    }
                }
            }
            for (let d = 0; d < n; d++) {
                xout.w[d] /= nv;
            }
            return xout;
        }
        predict(data) {
            const xout = this.predict_soft(data);
            let predicted_label;
            if (xout.w.length !== 0) {
                const stats = maxmin(xout.w);
                predicted_label = stats.maxi;
            }
            else {
                predicted_label = -1;
            }
            return predicted_label;
        }
        toJSON() {
            const nv = Math.min(this.ensemble_size, this.evaluated_candidates.length);
            const json = {};
            json.nets = [];
            for (let i = 0; i < nv; i++) {
                json.nets.push(this.evaluated_candidates[i].net.toJSON());
            }
            return json;
        }
        fromJSON(json) {
            this.ensemble_size = json.nets.length;
            this.evaluated_candidates = [];
            for (let i = 0; i < this.ensemble_size; i++) {
                const net = new convnet_net_1.Net();
                net.fromJSON(json.nets[i]);
                const dummy_candidate = {};
                dummy_candidate.net = net;
                this.evaluated_candidates.push(dummy_candidate);
            }
        }
        onFinishFold(f) { this.finish_fold_callback = f; }
        onFinishBatch(f) { this.finish_batch_callback = f; }
    }
    exports.MagicNet = MagicNet;
    ;
});
define("convnet_vol_util", ["require", "exports", "convnet_vol", "convnet_util"], function (require, exports, convnet_vol_5, uitl) {
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
            W = new convnet_vol_5.Vol(crop, crop, V.depth, 0.0);
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
        let x = new convnet_vol_5.Vol(W, H, 4, 0.0);
        x.w = pv;
        if (convert_grayscale) {
            const x1 = new convnet_vol_5.Vol(W, H, 1, 0.0);
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
define("index", ["require", "exports", "convnet_vol", "convnet_net", "convnet_magicnet", "convnet_util", "convnet_layers_dotproducts", "convnet_layers_dropout", "convnet_layers_loss", "convnet_layers_normalization", "convnet_layers_pool", "cnnvis", "cnnutil", "convnet_util", "convnet_vol_util", "deepqlearn", "convnet_trainers"], function (require, exports, convnet_vol_6, convnet_net_2, convnet_magicnet_1, convnet_util_1, convnet_layers_dotproducts_2, convnet_layers_dropout_2, convnet_layers_loss_2, convnet_layers_normalization_2, convnet_layers_pool_2, cnnvis, cnnutil, util, volutil, deepqlearn, convnet_trainers_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vol = convnet_vol_6.Vol;
    exports.Net = convnet_net_2.Net;
    exports.MagicNet = convnet_magicnet_1.MagicNet;
    exports.randf = convnet_util_1.randf;
    exports.randi = convnet_util_1.randi;
    exports.randn = convnet_util_1.randn;
    exports.randperm = convnet_util_1.randperm;
    exports.ConvLayer = convnet_layers_dotproducts_2.ConvLayer;
    exports.FullyConnLayer = convnet_layers_dotproducts_2.FullyConnLayer;
    exports.DropoutLayer = convnet_layers_dropout_2.DropoutLayer;
    exports.RegressionLayer = convnet_layers_loss_2.RegressionLayer;
    exports.SVMLayer = convnet_layers_loss_2.SVMLayer;
    exports.SoftmaxLayer = convnet_layers_loss_2.SoftmaxLayer;
    exports.LocalResponseNormalizationLayer = convnet_layers_normalization_2.LocalResponseNormalizationLayer;
    exports.PoolLayer = convnet_layers_pool_2.PoolLayer;
    exports.cnnvis = cnnvis;
    exports.cnnutil = cnnutil;
    exports.util = util;
    exports.volutil = volutil;
    exports.deepqlearn = deepqlearn;
    exports.Trainer = convnet_trainers_2.Trainer;
    exports.SGDTrainer = convnet_trainers_2.Trainer;
});
define("deepqlearn", ["require", "exports", "convnet_vol", "convnet_net", "index"], function (require, exports, convnet_vol_7, convnet_net_3, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Experience {
        constructor(state0, action0, reward0, state1) {
            this.state0 = state0;
            this.action0 = action0;
            this.reward0 = reward0;
            this.state1 = state1;
        }
    }
    exports.Experience = Experience;
    class Brain {
        constructor(num_states, num_actions, opt) {
            if (!opt) {
                opt = {};
            }
            this.temporal_window = typeof opt.temporal_window !== 'undefined' ? opt.temporal_window : 1;
            this.experience_size = typeof opt.experience_size !== 'undefined' ? opt.experience_size : 30000;
            this.start_learn_threshold = typeof opt.start_learn_threshold !== 'undefined' ? opt.start_learn_threshold : Math.floor(Math.min(this.experience_size * 0.1, 1000));
            this.gamma = typeof opt.gamma !== 'undefined' ? opt.gamma : 0.8;
            this.learning_steps_total = typeof opt.learning_steps_total !== 'undefined' ? opt.learning_steps_total : 100000;
            this.learning_steps_burnin = typeof opt.learning_steps_burnin !== 'undefined' ? opt.learning_steps_burnin : 3000;
            this.epsilon_min = typeof opt.epsilon_min !== 'undefined' ? opt.epsilon_min : 0.05;
            this.epsilon_test_time = typeof opt.epsilon_test_time !== 'undefined' ? opt.epsilon_test_time : 0.01;
            if (typeof opt.random_action_distribution !== 'undefined') {
                this.random_action_distribution = opt.random_action_distribution;
                if (this.random_action_distribution.length !== num_actions) {
                    console.log('TROUBLE. random_action_distribution should be same length as num_actions.');
                }
                const a = this.random_action_distribution;
                let s = 0.0;
                for (let k = 0; k < a.length; k++) {
                    s += a[k];
                }
                if (Math.abs(s - 1.0) > 0.0001) {
                    console.log('TROUBLE. random_action_distribution should sum to 1!');
                }
            }
            else {
                this.random_action_distribution = [];
            }
            this.net_inputs = num_states * this.temporal_window + num_actions * this.temporal_window + num_states;
            this.num_states = num_states;
            this.num_actions = num_actions;
            this.window_size = Math.max(this.temporal_window, 2);
            this.state_window = new Array(this.window_size);
            this.action_window = new Array(this.window_size);
            this.reward_window = new Array(this.window_size);
            this.net_window = new Array(this.window_size);
            let layer_defs = [];
            if (typeof opt.layer_defs !== 'undefined') {
                layer_defs = opt.layer_defs;
                if (layer_defs.length < 2) {
                    console.log('TROUBLE! must have at least 2 layers');
                }
                if (layer_defs[0].type !== 'input') {
                    console.log('TROUBLE! first layer must be input layer!');
                }
                if (layer_defs[layer_defs.length - 1].type !== 'regression') {
                    console.log('TROUBLE! last layer must be input regression!');
                }
                const inputlayerDef = layer_defs[0];
                if (inputlayerDef.out_depth * inputlayerDef.out_sx * inputlayerDef.out_sy !== this.net_inputs) {
                    console.log('TROUBLE! Number of inputs must be num_states * temporal_window + num_actions * temporal_window + num_states!');
                }
                if (layer_defs[layer_defs.length - 1].num_neurons !== this.num_actions) {
                    console.log('TROUBLE! Number of regression neurons should be num_actions!');
                }
            }
            else {
                layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: this.net_inputs });
                if (typeof opt.hidden_layer_sizes !== 'undefined') {
                    const hl = opt.hidden_layer_sizes;
                    for (let k = 0; k < hl.length; k++) {
                        layer_defs.push({ type: 'fc', num_neurons: hl[k], activation: 'relu' });
                    }
                }
                layer_defs.push({ type: 'regression', num_neurons: num_actions });
            }
            this.value_net = new convnet_net_3.Net();
            this.value_net.makeLayers(layer_defs);
            let tdtrainer_options = { learning_rate: 0.01, momentum: 0.0, batch_size: 64, l2_decay: 0.01 };
            if (typeof opt.tdtrainer_options !== 'undefined') {
                tdtrainer_options = opt.tdtrainer_options;
            }
            this.tdtrainer = new index_1.SGDTrainer(this.value_net, tdtrainer_options);
            this.experience = [];
            this.age = 0;
            this.forward_passes = 0;
            this.epsilon = 1.0;
            this.latest_reward = 0;
            this.last_input_array = [];
            this.average_reward_window = new index_1.cnnutil.Window(1000, 10);
            this.average_loss_window = new index_1.cnnutil.Window(1000, 10);
            this.learning = true;
        }
        random_action() {
            if (this.random_action_distribution.length === 0) {
                return index_1.util.randi(0, this.num_actions);
            }
            else {
                const p = index_1.util.randf(0, 1.0);
                let cumprob = 0.0;
                for (let k = 0; k < this.num_actions; k++) {
                    cumprob += this.random_action_distribution[k];
                    if (p < cumprob) {
                        return k;
                    }
                }
            }
        }
        policy(s) {
            const svol = new convnet_vol_7.Vol(1, 1, this.net_inputs);
            svol.w = s;
            const action_values = this.value_net.forward(svol);
            let maxk = 0;
            let maxval = action_values.w[0];
            for (let k = 1; k < this.num_actions; k++) {
                if (action_values.w[k] > maxval) {
                    maxk = k;
                    maxval = action_values.w[k];
                }
            }
            return { action: maxk, value: maxval };
        }
        getNetInput(xt) {
            let w = [];
            w = w.concat(xt);
            const n = this.window_size;
            for (let k = 0; k < this.temporal_window; k++) {
                w = w.concat(this.state_window[n - 1 - k]);
                const action1ofk = new Array(this.num_actions);
                for (let q = 0; q < this.num_actions; q++) {
                    action1ofk[q] = 0.0;
                }
                action1ofk[this.action_window[n - 1 - k]] = 1.0 * this.num_states;
                w = w.concat(action1ofk);
            }
            return w;
        }
        forward(input_array) {
            this.forward_passes += 1;
            this.last_input_array = input_array;
            let action;
            let net_input;
            if (this.forward_passes > this.temporal_window) {
                net_input = this.getNetInput(input_array);
                if (this.learning) {
                    this.epsilon = Math.min(1.0, Math.max(this.epsilon_min, 1.0 - (this.age - this.learning_steps_burnin) / (this.learning_steps_total - this.learning_steps_burnin)));
                }
                else {
                    this.epsilon = this.epsilon_test_time;
                }
                const rf = index_1.util.randf(0, 1);
                if (rf < this.epsilon) {
                    action = this.random_action();
                }
                else {
                    const maxact = this.policy(net_input);
                    action = maxact.action;
                }
            }
            else {
                action = this.random_action();
            }
            this.net_window.shift();
            this.net_window.push(net_input);
            this.state_window.shift();
            this.state_window.push(input_array);
            this.action_window.shift();
            this.action_window.push(action);
            return action;
        }
        backward(reward) {
            this.latest_reward = reward;
            this.average_reward_window.add(reward);
            this.reward_window.shift();
            this.reward_window.push(reward);
            if (!this.learning) {
                return;
            }
            this.age += 1;
            if (this.forward_passes > this.temporal_window + 1) {
                const e = new Experience();
                const n = this.window_size;
                e.state0 = this.net_window[n - 2];
                e.action0 = this.action_window[n - 2];
                e.reward0 = this.reward_window[n - 2];
                e.state1 = this.net_window[n - 1];
                if (this.experience.length < this.experience_size) {
                    this.experience.push(e);
                }
                else {
                    const ri = index_1.util.randi(0, this.experience_size);
                    this.experience[ri] = e;
                }
            }
            if (this.experience.length > this.start_learn_threshold) {
                let avcost = 0.0;
                for (let k = 0; k < this.tdtrainer.batch_size; k++) {
                    const re = index_1.util.randi(0, this.experience.length);
                    const e = this.experience[re];
                    const x = new convnet_vol_7.Vol(1, 1, this.net_inputs);
                    x.w = e.state0;
                    const maxact = this.policy(e.state1);
                    const r = e.reward0 + this.gamma * maxact.value;
                    const ystruct = { dim: e.action0, val: r };
                    const loss = this.tdtrainer.train(x, ystruct);
                    avcost += loss.loss;
                }
                avcost = avcost / this.tdtrainer.batch_size;
                this.average_loss_window.add(avcost);
            }
        }
        visSelf(elt) {
            elt.innerHTML = '';
            const brainvis = document.createElement('div');
            const desc = document.createElement('div');
            let t = '';
            t += 'experience replay size: ' + this.experience.length + '<br>';
            t += 'exploration epsilon: ' + this.epsilon + '<br>';
            t += 'age: ' + this.age + '<br>';
            t += 'average Q-learning loss: ' + this.average_loss_window.get_average() + '<br />';
            t += 'smooth-ish reward: ' + this.average_reward_window.get_average() + '<br />';
            desc.innerHTML = t;
            brainvis.appendChild(desc);
            elt.appendChild(brainvis);
        }
    }
    exports.Brain = Brain;
});
//# sourceMappingURL=convnetjs-ts.js.map