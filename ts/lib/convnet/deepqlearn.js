define(["require", "exports", "./convnet_vol", "./convnet_net", "./index"], function (require, exports, convnet_vol_1, convnet_net_1, index_1) {
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
            this.value_net = new convnet_net_1.Net();
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
            const svol = new convnet_vol_1.Vol(1, 1, this.net_inputs);
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
                    const x = new convnet_vol_1.Vol(1, 1, this.net_inputs);
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
//# sourceMappingURL=deepqlearn.js.map