import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Project} from "../docState";
import {HistoryEntry} from "../history/historyEntry";
import {ActionInterface} from "./actionInterface";

/**
 * Draw a shape tool.
 */
export class LineTool extends Tool {
    constructor () {
        super("LineTool", "Line");
        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({
            name: "strokeAlpha",
            descName: "Stroke transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name:"maxValue", desc: "100"},
                {name:"minValue", desc: "0"}
            ]});
        this.addSetting({name: "lineWidth", descName: "Line width", inputType: InputType.Number, defaultValue: "5"});
    }

    reset () {}

    startUse (img, pos) {
        this.data = {
            firstCorner: pos,
            lastCorner: pos,
        };
    };

    continueUse (pos) {
        this.data.lastCorner = pos;
    };

    endUse (pos) {
        this.continueUse(pos);
    };

    drawPreview (ctx) {
        ctx.globalAlpha = this.getSetting("strokeAlpha") / 100;
        ctx.strokeStyle = this.getSetting('strokeColor');
        ctx.lineWidth = this.getSetting('lineWidth');
        ctx.beginPath();
        ctx.moveTo(this.data.firstCorner.x, this.data.firstCorner.y);
        ctx.lineTo(this.data.lastCorner.x, this.data.lastCorner.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    };

    applyTool (context: CanvasRenderingContext2D): HistoryEntry {
        this.drawPreview(context);
        return new HistoryEntry(()=>{},()=>{}, []);
    }
}