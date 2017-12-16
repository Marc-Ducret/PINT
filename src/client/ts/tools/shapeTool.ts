import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Project} from "../docState";
import {HistoryEntry} from "../history/historyEntry";
import {ActionInterface} from "../../../common/actionInterface";

/**
 * Draw a shape tool.
 */
export class ShapeTool extends Tool {
    constructor () {
        super("ShapeTool", "Shape");
        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#ffffff"});
        this.addSetting({
            name: "strokeAlpha",
            descName: "Stroke transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name:"maxValue", desc: "100"},
                {name:"minValue", desc: "0"}
            ]});

        this.addSetting({name: "fillColor", descName: "Fill color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({
            name: "fillAlpha",
            descName: "Fill transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name:"maxValue", desc: "100"},
                {name:"minValue", desc: "0"}
            ]});

        this.addSetting({name: "lineWidth", descName: "Line width", inputType: InputType.Number, defaultValue: "5"});
        this.addSetting({name: "shape", descName: "Shape", inputType: InputType.Select, defaultValue: "square",
                                options: [{name: "square", desc: "Square"},
                                        {name: "circle", desc: "Circle"},
                                        {name: "ellipse", desc: "Ellipse"}]});
    }

    startUse (img, pos) {
        this.data.actionData = {
            firstCorner: pos,
            lastCorner: pos,
        };
    };

    continueUse (pos) {
        this.data.actionData.lastCorner = pos;
    };

    reset () {}

    endUse (pos): ActionInterface {
        this.continueUse(pos);
        return this.data;
    };

    drawPreview (ctx) {
        ctx.fillStyle = this.getSetting('fillColor');
        ctx.strokeStyle = this.getSetting('strokeColor');
        ctx.lineWidth = this.getSetting('lineWidth');

        let firstCorner = this.data.actionData.firstCorner;
        let lastCorner = this.data.actionData.lastCorner;

        switch (this.getSetting('shape')) {
            case "square":
                ctx.beginPath();
                const x = Math.min(firstCorner.x, lastCorner.x) + .5,
                    y = Math.min(firstCorner.y, lastCorner.y) + .5,
                    w = Math.abs(firstCorner.x - lastCorner.x),
                    h = Math.abs(firstCorner.y - lastCorner.y);
                ctx.rect(x,y,w,h);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(firstCorner.x, firstCorner.y, firstCorner.distance(lastCorner), 0, 2 * Math.PI, false);
                break;
            case "ellipse":
                const xdep = lastCorner.x/2 + firstCorner.x/2,
                    ydep = lastCorner.y/2 + firstCorner.y/2,
                    xlen = Math.abs(lastCorner.x/2 - firstCorner.x/2),
                    ylen = Math.abs(lastCorner.y/2 - firstCorner.y/2);
                ctx.beginPath();
                ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                break;
            default:
                console.error("No shape selected.");
                break;
        }
        ctx.globalAlpha = this.getSetting("fillAlpha")/100;
        ctx.fill();
        ctx.globalAlpha = this.getSetting("strokeAlpha")/100;
        ctx.stroke();
        ctx.globalAlpha = 1;
    };

    applyTool (context: CanvasRenderingContext2D): HistoryEntry {
        this.drawPreview(context);
        return new HistoryEntry(()=>{},()=>{}, []);
    }
}
