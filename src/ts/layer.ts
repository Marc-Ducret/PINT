import * as $ from "jquery";

export class Layer {
    canvasElement: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor (dimensions: Vec2) {
        this.canvasElement = $("<canvas></canvas>") as JQuery<HTMLCanvasElement>;
        this.context = this.canvasElement[0].getContext('2d');

        this.canvasElement[0].width = dimensions.x;
        this.canvasElement[0].height = dimensions.y;
        this.width = dimensions.x;
        this.height = dimensions.y;
    }

    getHTMLElement () {
        return this.canvasElement[0];
    };

    getContext () {
        return this.context;
    };

    reset = function() {
        this.context.clearRect(0,0,this.width,this.height);
    };

    fill = function() {
        this.context.fillStyle = "#ffffff";
        this.context.strokeStyle = "#ffffff";
        this.context.fillRect(0,0,this.width,this.height);
    };
}
