import * as convnetjs from "../../lib/convnet/index";
import {Vec2} from "../vec2";
import {Layer} from "../ui/layer";

class Generator {
    public generate;
    public type: number;

    constructor(generate, type: number) {
        this.generate = generate;
        this.type = type;
    }
}

export class Classifier {
    private layer_defs;
    private net;
    private trainer;
    private generators: Array<Generator>;

    constructor(generators: Array<Generator>) {
        this.layer_defs = [];
        this.layer_defs.push({type:'input', out_sx:32, out_sy:32, out_depth:1});
        this.layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
        this.layer_defs.push({type:'pool', sx:2, stride:2});
        this.layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
        this.layer_defs.push({type:'pool', sx:2, stride:2});
        this.layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
        this.layer_defs.push({type:'pool', sx:2, stride:2});
        this.layer_defs.push({type:'softmax', num_classes:2});

        this.net = new convnetjs.Net();
        this.net.makeLayers(this.layer_defs);

        this.trainer = new convnetjs.SGDTrainer(this.net, {method:'adadelta', batch_size:4, l2_decay:0.0001});

        this.generators = generators;
    }

    train(n: number) {
        console.log('training on '+n+' samples');
        for(let i = 0; i < n; i++) {
            let gen = this.generators[Math.floor(Math.random() * this.generators.length)];
            this.trainer.train(asVol(gen.generate()), gen.type);
            if((i+1) % 500 == 0) {
                console.log('did '+(100*(i+1)/n)+'%');
                if((i+1) % 5000 == 0) {
                    let acc = this.testAccuracyOnGenerated(100);
                    console.log('accuracy: '+acc);
                }
            }
        }
        console.log('training done');
        this.export();
    }

    testAccuracyOnGenerated(n: number) {
        let acc = [];
        for(let g = 0; g < this.generators.length; g++) {
            let gen = this.generators[g];
            let success = 0;
            for(let i = 0; i < n; i ++) {
                if(this.classify(gen.generate()) === (gen.type === 1)) {
                    success += 1;
                }
            }
            acc.push(success / n);
        }
        return acc;
    }

    classify(img): boolean {
        this.net.forward(asVol(img));
        return this.net.getPrediction() == 1;
    }

    export() {
        let download = function(text, name, type) {
            var a = document.createElement("a");
            var file = new Blob([text], {type: type});
            a.href = URL.createObjectURL(file);
            a.download = name;
            a.click();
        }
        download(JSON.stringify(this.net.toJSON()), 'net.json', 'text/plain');
    }

    import(savedNet) {
        this.net.fromJSON(savedNet);
    }
}

function asVol(img) {
    let size = 32;
    var x = new convnetjs.Vol(size, size, 1, 0.0);
    for(let i = 0; i < size * size; i ++) {
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

    while(Math.abs(fg - bg) < (1 - noise) / 3) {
        fg = Math.random() * (1 - noise);
    }

    for(let i = 0; i < size * size; i ++) {
        img.push(bg + Math.random() * noise);
    }
    let w = Math.floor((.2 + Math.random() * .6) * size);
    let h = Math.floor((.2 + Math.random() * .6) * size);
    let x = Math.floor(Math.random() * (size - w));
    let y = Math.floor(Math.random() * (size - h));
    for(let j = 0; j < h; j ++) {
        for(let i = 0; i < w; i ++) {
            img[(y + j) * size + (x + i)] = fg + Math.random() * noise;
        }
    }
    return img;
}

function generateNegative() {
    let img = [];
    let size = 32;
    let noise = 0 * Math.random();
    let color = Math.random() * (1 - noise);
    for(let i = 0; i < size * size; i ++) {
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
    while(Math.abs(fg - bg) < (1 - noise) / 3) {
        fg = Math.random() * (1 - noise);
    }

    for(let i = 0; i < size * size; i ++) {
        img.push(bg + Math.random() * noise);
    }
    let w = Math.floor((.2 + Math.random() * .6) * size);
    let h = Math.floor((.2 + Math.random() * .6) * size);
    let x = Math.floor(w/2 + Math.random() * (size - w));
    let y = Math.floor(h/2 + Math.random() * (size - h));
    for(let j = 0; j < size; j ++) {
        for(let i = 0; i < size; i ++) {
            if(((i-x)/w) ** 2 + ((j-y)/h) ** 2 < 1/4) {
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
    while(Math.abs(fg - bg) < (1 - noise) / 3) {
        fg = Math.random() * (1 - noise);
    }

    for(let i = 0; i < size * size; i ++) {
        img.push(bg + Math.random() * noise);
    }
    let x = Math.floor(Math.random() * size);
    let y = Math.floor(Math.random() * size);
    while(Math.random() > 8 / size**2) {
        let sign = Math.random() > .5 ? +1 : -1;
        if(Math.random() > .5) {
            x += sign;
        } else {
            y += sign;
        }
        if(x < 0 || x >= size || y < 0 || y >= size) {
            break;
        }
        img[y * size + x] = fg + Math.random() * noise;
    }

    return img;
}

var classifier: Classifier;

export function initClassifier(savedNet) {
    classifier = new Classifier([]);
    classifier.import(savedNet);
}

export function initClassifierByTraining() {
    let generators: Array<Generator> = [];
    generators.push(new Generator(generatePositive, 1));
    generators.push(new Generator(generateNegative, 0));
    generators.push(new Generator(generateNegativeCircle, 0));
    generators.push(new Generator(generateNegativeRandom, 0));
    for(let i = 0; i < generators.length; i++) {
        console.log('generator '+i+' of type '+generators[i].type);
        logImg(generators[i].generate());
    }
    classifier = new Classifier(generators);
    classifier.train(500000);
}

function downgreyscale(img: ImageData) {
    let size = 32;
    let imgOut = [];
    for(let y = 0; y < size; y++) {
        for(let x = 0; x < size; x++) {
            let comps = 3;
            let value = 0;
            let x_in = Math.floor(x * img.width / size);
            let y_in = Math.floor(y * img.height / size);
            for(let i = 0; i < comps; i++) {
                value += img.data[(y_in * img.width + x_in) * (comps+1) + i] / 0xFF / comps;
            }
            imgOut.push(value);
        }
    }
    return imgOut;
}

export function hasSquare(img: ImageData): boolean {
    let sample = downgreyscale(img);
    console.log('downgreyscale sample');
    logImg(sample);
    return classifier.classify(sample);
}

function logImg(img) {
    let size = 32;
    let layer: Layer = new Layer(new Vec2(size, size));
    let imgData: ImageData = layer.getContext().getImageData(0, 0, size, size);
    for(let i: number = 0; i < size * size; i ++) {
        for(let j: number = 0; j < 3; j ++) {
            imgData.data[i * 4 + j] = Math.floor(img[i] * 0xFF);
        }
        imgData.data[i * 4 + 3] = 0xFF;
    }
    layer.getContext().putImageData(imgData, 0, 0);
    console.log(layer.getHTMLElement().toDataURL());
}
