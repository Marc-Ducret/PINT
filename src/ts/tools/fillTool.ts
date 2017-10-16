/**
 * Fill all pixels with a single color
 */

import {Tool} from "./tool";

export class FillTool extends Tool {
    constructor() {
        super("FillTool");
        this.addSetting({name: "fillColor", descName: "Fill color", inputType: "color", defaultValue: "#000000"});
    }

    startUse (img, pos) {
    };

    endUse (pos) {
        return null;
    };

    continueUse (pos) {
    };

    drawPreview (ctx) {
        ctx.fillStyle = this.settings.get("fillColor");

        let x = 0,
            y = 0,
            w = ctx.canvas.width,
            h = ctx.canvas.height;
        ctx.rect(x,y,w,h);
        ctx.fill();
        ctx.stroke();
    };
}

