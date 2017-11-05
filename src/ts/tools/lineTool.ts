import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";

/**
 * Draw a shape tool.
 */
export class LineTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;

    constructor () {
        super("LineTool", "Line");
        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Line width", inputType: InputType.Number, defaultValue: "5"});
    }

    reset () {
        this.firstCorner = null;
        this.lastCorner = null;
    }

    startUse (img, pos, project) {
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
        if (this.firstCorner == null || this.lastCorner == null) {
            return;
        }

        ctx.strokeStyle = this.getSetting('strokeColor');
        ctx.lineWidth = this.getSetting('lineWidth');
        ctx.beginPath();
        ctx.moveTo(this.firstCorner.x, this.firstCorner.y);
        ctx.lineTo(this.lastCorner.x, this.lastCorner.y);
        ctx.stroke();
    };
}
