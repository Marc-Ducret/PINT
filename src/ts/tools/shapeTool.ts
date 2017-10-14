import {Tool} from "../tool";
import {Vec2} from "../vec2";

export class ShapeTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;

    constructor () {
        super("ShapeTool");
        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#ffffff"});
        this.addSetting({name: "fillColor", descName: "Fill color", inputType: "color", defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Line width", inputType: "number", defaultValue: "5"});
        this.addSetting({name: "shape", descName: "Shape", inputType: "select", defaultValue: "square",
                                options: [{name: "square", desc: "Square"},
                                        {name: "circle", desc: "Circle"},
                                        {name: "ellipse", desc: "Ellipse"}]});
    }

    startUse (img, pos) {
        this.firstCorner = pos;
        this.lastCorner = pos;
    };

    continueUse (pos) {
        this.lastCorner = pos;
    };

    endUse (pos) {
        this.continueUse(pos);
        return null;
    };

    drawPreview (ctx) {
        ctx.fillStyle = this.settings.get('fillColor');
        ctx.strokeStyle = this.settings.get('strokeColor');
        ctx.lineWidth = this.settings.get('lineWidth');

        switch (this.settings.get('shape')) {
            case "square":
                ctx.beginPath();
                var x = Math.min(this.firstCorner.x, this.lastCorner.x),
                    y = Math.min(this.firstCorner.y, this.lastCorner.y),
                    w = Math.abs(this.firstCorner.x - this.lastCorner.x),
                    h = Math.abs(this.firstCorner.y - this.lastCorner.y);
                ctx.rect(x,y,w,h);
                ctx.fill();
                ctx.stroke();
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(this.firstCorner.x, this.firstCorner.y, this.firstCorner.distance(this.lastCorner), 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();
                break;
            case "ellipse":
                var xdep = this.lastCorner.x/2 + this.firstCorner.x/2,
                    ydep = this.lastCorner.y/2 + this.firstCorner.y/2,
                    xlen = Math.abs(this.lastCorner.x/2 - this.firstCorner.x/2),
                    ylen = Math.abs(this.lastCorner.y/2 - this.firstCorner.y/2);
                ctx.beginPath();
                ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
            default:
                console.error("No shape selected.");
                break;
        }

    };
}

