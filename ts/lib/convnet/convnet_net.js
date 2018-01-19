define(["require", "exports", "./convnet_util", "./convnet_layers_loss", "./convnet_layers_dotproducts", "./convnet_layers_nonlinearities", "./convnet_layers_pool", "./convnet_layers_input", "./convnet_layers_dropout", "./convnet_layers_normalization"], function (require, exports, util, convnet_layers_loss_1, convnet_layers_dotproducts_1, convnet_layers_nonlinearities_1, convnet_layers_pool_1, convnet_layers_input_1, convnet_layers_dropout_1, convnet_layers_normalization_1) {
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
//# sourceMappingURL=convnet_net.js.map