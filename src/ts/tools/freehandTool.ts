/**
 * A freehand drawing tool
 */
import {Tool} from "./tool";
import {Vec2} from "../vec2";

export class FreehandTool extends Tool {
    positions: Array<Vec2> = [];

    constructor() {
        super("FreehandTool");

        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Stroke width", inputType: "number", defaultValue: "5"});

    }

    startUse (img, pos) {
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
        ctx.lineWidth = this.settings.get("lineWidth");
        ctx.strokeStyle = this.settings.get("strokeColor");
        ctx.stroke();
    };
}
