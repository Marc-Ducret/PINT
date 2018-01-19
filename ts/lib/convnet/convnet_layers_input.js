define(["require", "exports", "./layers", "./convnet_util"], function (require, exports, layers_1, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const getopt = util.getopt;
    class InputLayer extends layers_1.LayerBase {
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
//# sourceMappingURL=convnet_layers_input.js.map