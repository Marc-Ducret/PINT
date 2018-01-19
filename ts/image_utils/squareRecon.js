define(["require", "exports", "../lib/convnet/index", "../vec2", "../ui/layer"], function (require, exports, convnetjs, vec2_1, layer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Generator {
        constructor(generate, type) {
            this.generate = generate;
            this.type = type;
        }
    }
    class Classifier {
        constructor(generators) {
            this.layer_defs = [];
            this.layer_defs.push({ type: 'input', out_sx: 32, out_sy: 32, out_depth: 1 });
            this.layer_defs.push({ type: 'conv', sx: 5, filters: 16, stride: 1, pad: 2, activation: 'relu' });
            this.layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
            this.layer_defs.push({ type: 'conv', sx: 5, filters: 20, stride: 1, pad: 2, activation: 'relu' });
            this.layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
            this.layer_defs.push({ type: 'conv', sx: 5, filters: 20, stride: 1, pad: 2, activation: 'relu' });
            this.layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
            this.layer_defs.push({ type: 'softmax', num_classes: 2 });
            this.net = new convnetjs.Net();
            this.net.makeLayers(this.layer_defs);
            this.trainer = new convnetjs.SGDTrainer(this.net, { method: 'adadelta', batch_size: 4, l2_decay: 0.0001 });
            this.generators = generators;
        }
        train(n) {
            console.log('training on ' + n + ' samples');
            for (let i = 0; i < n; i++) {
                let gen = this.generators[Math.floor(Math.random() * this.generators.length)];
                this.trainer.train(asVol(gen.generate()), gen.type);
                if ((i + 1) % 500 == 0) {
                    console.log('did ' + (100 * (i + 1) / n) + '%');
                    if ((i + 1) % 5000 == 0) {
                        let acc = this.testAccuracyOnGenerated(100);
                        console.log('accuracy: ' + acc);
                    }
                }
            }
            console.log('training done');
            this.export();
        }
        testAccuracyOnGenerated(n) {
            let acc = [];
            for (let g = 0; g < this.generators.length; g++) {
                let gen = this.generators[g];
                let success = 0;
                for (let i = 0; i < n; i++) {
                    if (this.classify(gen.generate()) === (gen.type === 1)) {
                        success += 1;
                    }
                }
                acc.push(success / n);
            }
            return acc;
        }
        classify(img) {
            this.net.forward(asVol(img));
            return this.net.getPrediction() == 1;
        }
        export() {
            let download = function (text, name, type) {
                let a = document.createElement("a");
                let file = new Blob([text], { type: type });
                a.href = URL.createObjectURL(file);
                a.download = name;
                a.click();
            };
            download(JSON.stringify(this.net.toJSON()), 'net.json', 'text/plain');
        }
        import(savedNet) {
            this.net.fromJSON(savedNet);
        }
    }
    exports.Classifier = Classifier;
    function asVol(img) {
        let size = 32;
        let x = new convnetjs.Vol(size, size, 1, 0.0);
        for (let i = 0; i < size * size; i++) {
            x.w[i] = img[i];
        }
        return x;
    }
    function generatePositive() {
        let img = [];
        let size = 32;
        let noise = .1 * Math.random();
        let bg = Math.random() * (1 - noise);
        let fg = Math.random() * (1 - noise);
        while (Math.abs(fg - bg) < (1 - noise) / 3) {
            fg = Math.random() * (1 - noise);
        }
        for (let i = 0; i < size * size; i++) {
            img.push(bg + Math.random() * noise);
        }
        let w = Math.floor((.2 + Math.random() * .6) * size);
        let h = Math.floor((.2 + Math.random() * .6) * size);
        let x = Math.floor(Math.random() * (size - w));
        let y = Math.floor(Math.random() * (size - h));
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                img[(y + j) * size + (x + i)] = fg + Math.random() * noise;
            }
        }
        return img;
    }
    function generateNegative() {
        let img = [];
        let size = 32;
        let noise = .1 * Math.random();
        let color = Math.random() * (1 - noise);
        for (let i = 0; i < size * size; i++) {
            img.push(color + Math.random() * noise);
        }
        return img;
    }
    function generateNegativeCircle() {
        let img = [];
        let size = 32;
        let noise = .1 * Math.random();
        let bg = Math.random() * (1 - noise);
        let fg = Math.random() * (1 - noise);
        while (Math.abs(fg - bg) < (1 - noise) / 3) {
            fg = Math.random() * (1 - noise);
        }
        for (let i = 0; i < size * size; i++) {
            img.push(bg + Math.random() * noise);
        }
        let w = Math.floor((.2 + Math.random() * .6) * size);
        let h = Math.floor((.2 + Math.random() * .6) * size);
        let x = Math.floor(w / 2 + Math.random() * (size - w));
        let y = Math.floor(h / 2 + Math.random() * (size - h));
        for (let j = 0; j < size; j++) {
            for (let i = 0; i < size; i++) {
                if (Math.pow(((i - x) / w), 2) + Math.pow(((j - y) / h), 2) < 1 / 4) {
                    img[j * size + i] = fg + Math.random() * noise;
                }
            }
        }
        return img;
    }
    function generateNegativeRandom() {
        let img = [];
        let size = 32;
        let noise = .1 * Math.random();
        let bg = Math.random() * (1 - noise);
        let fg = Math.random() * (1 - noise);
        while (Math.abs(fg - bg) < (1 - noise) / 3) {
            fg = Math.random() * (1 - noise);
        }
        for (let i = 0; i < size * size; i++) {
            img.push(bg + Math.random() * noise);
        }
        let x = Math.floor(Math.random() * size);
        let y = Math.floor(Math.random() * size);
        while (Math.random() > 8 / Math.pow(size, 2)) {
            let sign = Math.random() > .5 ? +1 : -1;
            if (Math.random() > .5) {
                x += sign;
            }
            else {
                y += sign;
            }
            if (x < 0 || x >= size || y < 0 || y >= size) {
                break;
            }
            img[y * size + x] = fg + Math.random() * noise;
        }
        return img;
    }
    let classifier;
    function initClassifier(savedNet) {
        classifier = new Classifier([]);
        classifier.import(savedNet);
    }
    exports.initClassifier = initClassifier;
    function initClassifierByTraining() {
        let generators = [];
        generators.push(new Generator(generatePositive, 1));
        generators.push(new Generator(generateNegative, 0));
        generators.push(new Generator(generateNegativeCircle, 0));
        generators.push(new Generator(generateNegativeRandom, 0));
        for (let i = 0; i < generators.length; i++) {
            console.log('generator ' + i + ' of type ' + generators[i].type);
            logImg(generators[i].generate());
        }
        classifier = new Classifier(generators);
        classifier.train(500000);
    }
    exports.initClassifierByTraining = initClassifierByTraining;
    function downgreyscale(img) {
        let size = 32;
        let imgOut = [];
        let counts = [];
        for (let i = 0; i < size * size; i++) {
            imgOut.push(0);
            counts.push(0);
        }
        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                let comps = 3;
                let x_o = Math.floor(x * size / img.width);
                let y_o = Math.floor(y * size / img.height);
                for (let i = 0; i < comps; i++) {
                    imgOut[y_o * size + x_o] += img.data[(y * img.width + x) * (comps + 1) + i] / 0xFF;
                    counts[y_o * size + x_o] += 1;
                }
            }
        }
        for (let i = 0; i < Math.pow(size, 2); i++) {
            imgOut[i] /= counts[i];
        }
        return imgOut;
    }
    function hasSquare(img) {
        let sample = downgreyscale(img);
        return classifier.classify(sample);
    }
    exports.hasSquare = hasSquare;
    function logImg(img) {
        let size = 32;
        let layer = new layer_1.Layer(new vec2_1.Vec2(size, size));
        let imgData = layer.getContext().getImageData(0, 0, size, size);
        for (let i = 0; i < size * size; i++) {
            for (let j = 0; j < 3; j++) {
                imgData.data[i * 4 + j] = Math.floor(img[i] * 0xFF);
            }
            imgData.data[i * 4 + 3] = 0xFF;
        }
        layer.getContext().putImageData(imgData, 0, 0);
        console.log(layer.getHTMLElement().toDataURL());
    }
});
//# sourceMappingURL=squareRecon.js.map