/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";

export class SelectionTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;
    project: Project;

    constructor() {
        super("SelectionTool");

        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#FF00FF"});
        this.addSetting({name: "lineWidth", descName: "Line width", inputType: "number", defaultValue: "1"});
        this.addSetting({
            name: "shape", descName: "Shape", inputType: "select", defaultValue: "square",
            options: [{name: "square", desc: "Square"},
                {name: "circle", desc: "Circle"},
                {name: "ellipse", desc: "Ellipse"},
                {name: "arbitrary", desc: "Arbitrary"}]
        });
    }


    startUse(img: ImageData, pos: Vec2, project: Project) {
        this.firstCorner = pos;
        this.lastCorner = pos;
        this.project = project;
    };

    continueUse(pos) {
        this.lastCorner = pos;
    };

    endUse(pos) {
        this.continueUse(pos);

        let selection = new Uint8ClampedArray(this.project.dimensions.x * this.project.dimensions.y);
        switch (this.settings.get("shape")) {
            case "square":
                for (var y = Math.floor(Math.min(this.firstCorner.y, this.lastCorner.y)); y < Math.max(this.firstCorner.y, this.lastCorner.y); y++) {
                    for (var x = Math.floor(Math.min(this.firstCorner.x, this.lastCorner.x)); x < Math.max(this.firstCorner.x, this.lastCorner.x); x++) {
                        selection[x + y * this.project.dimensions.x] = 0xFF;
                    }
                }
                break;
            case "circle":
                break;
            case "ellipse":
                break;
            case "arbitrary":
                break;
            default:
                console.error("No shape selected.");
                break;
        }
        this.project.currentSelection.addRegion(selection);
        this.project.currentSelection.updateBorder();
        return false;
    };

    drawPreview(ctx) {
        ctx.strokeStyle = this.settings.get("strokeColor");
        ctx.lineWidth = this.settings.get("lineWidth");

        switch (this.settings.get("shape")) {
            case "square":
                ctx.beginPath();
                let x = Math.min(this.firstCorner.x, this.lastCorner.x),
                    y = Math.min(this.firstCorner.y, this.lastCorner.y),
                    w = Math.abs(this.firstCorner.x - this.lastCorner.x),
                    h = Math.abs(this.firstCorner.y - this.lastCorner.y);
                ctx.rect(x, y, w, h);
                ctx.stroke();
                break;
            case "circle":
                ctx.beginPath();
                let center = this.firstCorner;
                let radius = center.distance(this.lastCorner);
                ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
                ctx.stroke();
                break;
            case "ellipse":
                let xdep = this.lastCorner.x / 2 + this.firstCorner.x / 2,
                    ydep = this.lastCorner.y / 2 + this.firstCorner.y / 2,
                    xlen = Math.abs(this.lastCorner.x / 2 - this.firstCorner.x / 2),
                    ylen = Math.abs(this.lastCorner.y / 2 - this.firstCorner.y / 2);
                ctx.beginPath();
                ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            default:
                console.error("No shape selected.");
                break;
        }
    };
}
