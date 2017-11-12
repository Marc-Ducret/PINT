import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Project} from "../docState";

/**
 * Draw a shape tool.
 */
export class ShapeTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;
    project: Project;

    constructor () {
        super("ShapeTool", "Shape");
        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#ffffff"});
        this.addSetting({name: "fillColor", descName: "Fill color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Line width", inputType: InputType.Number, defaultValue: "5"});
        this.addSetting({name: "shape", descName: "Shape", inputType: InputType.Select, defaultValue: "square",
                                options: [{name: "square", desc: "Square"},
                                        {name: "circle", desc: "Circle"},
                                        {name: "ellipse", desc: "Ellipse"}]});
    }

    startUse (img, pos, project) {
        this.firstCorner = pos;
        this.lastCorner = pos;
        this.project = project;
    };

    continueUse (pos) {
        this.lastCorner = pos;
    };

    reset () {
        this.firstCorner = null;
        this.lastCorner = null;
    }

    endUse (pos) {
        this.continueUse(pos);
        return this.defaultHistoryEntry(this.project);
    };

    drawPreview (ctx) {
        if (this.firstCorner == null || this.lastCorner == null) {
            return;
        }

        ctx.fillStyle = this.getSetting('fillColor');
        ctx.strokeStyle = this.getSetting('strokeColor');
        ctx.lineWidth = this.getSetting('lineWidth');

        switch (this.getSetting('shape')) {
            case "square":
                ctx.beginPath();
                const x = Math.min(this.firstCorner.x, this.lastCorner.x),
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
                const xdep = this.lastCorner.x/2 + this.firstCorner.x/2,
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
