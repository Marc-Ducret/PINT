import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Project} from "../docState";
import {ActionInterface} from "./actionInterface";
import {HistoryEntry} from "../history/historyEntry";

/**
 * Draw a linear gradient of two colors.
 */
export class GradientTool extends Tool {
    constructor () {
        super("GradientTool", "Gradient");
        // define the two colors of the gradient:
        this.addSetting({name: "color1", descName: "from", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "color2", descName: "to", inputType: InputType.Color, defaultValue: "#FFFFFF"});
        // set transparency settings:
        this.addSetting({
            name: "transparencyAlpha",
            descName: "transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name:"maxValue", desc: "100"},
                {name:"minValue", desc: "0"}
            ]});
    }

    reset () {}

    startUse (img, pos) {
        this.data = {
            firstCorner: pos,
            lastCorner: pos,
            width: img.width,
            height: img.height,
        };

    };

    continueUse (pos) {
        this.data.lastCorner = pos;
    };

    endUse (pos): ActionInterface {
        this.continueUse(pos);
        return this.data;
    };

    drawPreview (ctx) {
        ctx.globalAlpha = this.getSetting('transparencyAlpha') / 100;

        let gradient = ctx.createLinearGradient(this.data.firstCorner.x, this.data.firstCorner.y,
                                                this.data.lastCorner.x, this.data.lastCorner.y);
        gradient.addColorStop(0, this.getSetting('color1'));
        gradient.addColorStop(1, this.getSetting('color2'));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.data.width, this.data.height);
        ctx.globalAlpha = 1;
    };

    applyTool (context: CanvasRenderingContext2D): HistoryEntry {
        this.drawPreview(context);
        return new HistoryEntry(()=>{},()=>{}, []);
    }
}
