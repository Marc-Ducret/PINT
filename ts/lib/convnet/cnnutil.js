define(["require", "exports"], function (require, exports) {
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
//# sourceMappingURL=cnnutil.js.map