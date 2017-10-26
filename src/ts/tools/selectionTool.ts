/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {InputType} from "../tool_settings/settingsRequester";

/**
 * Shape selection tool, allows the user to add a shape to current selection.
 */
export class SelectionTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;
    project: Project;

    constructor() {
        super("SelectionTool");

        this.addSetting({
            name: "shape", descName: "Shape", inputType: InputType.Select, defaultValue: "square",
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
        switch (this.getSetting("shape")) {
            case "square":
                for (let y = Math.floor(Math.min(this.firstCorner.y, this.lastCorner.y)); y < Math.max(this.firstCorner.y, this.lastCorner.y); y++) {
                    for (let x = Math.floor(Math.min(this.firstCorner.x, this.lastCorner.x)); x < Math.max(this.firstCorner.x, this.lastCorner.x); x++) {
                        selection[x + y * this.project.dimensions.x] = 0xFF;
                    }
                }
                break;
            case "circle":
                let ct = 0;
                let radius = Math.ceil(this.firstCorner.distance(this.lastCorner));
                console.log("counting within ", radius);
                for (let y = this.firstCorner.y - radius; y < this.firstCorner.y + radius; y++) {
                    for (let x = this.firstCorner.x - radius; x < this.firstCorner.x + radius; x++) {
                        if(x >= 0 && x < this.project.dimensions.x && y >= 0 && y < this.project.dimensions.y
                            && (x - this.firstCorner.x) ** 2 + (y - this.firstCorner.y) ** 2 <= radius ** 2) {
                            selection[x + y * this.project.dimensions.x] = 0xFF;
                            ct++;
                        }
                    }
                }
                console.log("found ", ct);
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
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        switch (this.getSetting("shape")) {
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
