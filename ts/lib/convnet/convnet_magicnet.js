define(["require", "exports", "./convnet_util", "./convnet_net", "./convnet_trainers"], function (require, exports, util, convnet_net_1, convnet_trainers_1) {
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
//# sourceMappingURL=convnet_magicnet.js.map