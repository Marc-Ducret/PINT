define(["require", "exports"], function (require, exports) {
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
//# sourceMappingURL=convnet_util.js.map