/**
 * A freehand drawing tool
 */
import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";

/**
 * Freehand drawing tool.
 */
export class FreehandTool extends Tool {
    positions: Array<Vec2> = [];

    /**
     * Instantiates the tool with name FreehandTool.
     * Takes two settings: stroke color and line width.
     */
    constructor() {
        super("FreehandTool");

        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Stroke width", inputType: InputType.Number, defaultValue: "5"});

    }

    startUse (img, pos, project) {
        this.positions = [];
        this.continueUse(pos);
    };

    endUse (pos) {
        this.continueUse(pos);
        return null;
    };

    continueUse (pos) {
        this.positions.push(pos);
    };

    drawPreview (ctx) {
        ctx.beginPath();
        for (let i = 0; i < this.positions.length; i++) {
            let pos = this.positions[i];
            if(i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.lineWidth = this.getSetting("lineWidth");
        ctx.strokeStyle = this.getSetting("strokeColor");
        ctx.stroke();
    };
}
