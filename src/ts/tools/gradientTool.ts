import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Project} from "../docState";

/**
 * Draw a linear gradient of two colors.
 */
export class GradientTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;
    project: Project;
    width: number;
    height: number;

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

    reset () {
        this.firstCorner = null;
        this.lastCorner = null;
    }

    startUse (img, pos, project) {
        this.firstCorner = pos; // starting point of the gradient
        this.lastCorner = pos; // ending point of the gradient
        this.project = project;
        this.width = img.width; // width of the canvas
        this.height = img.height; // height of the canvas
    };

    continueUse (pos) {
        this.lastCorner = pos;
    };

    endUse (pos) {
        this.continueUse(pos);
        return this.defaultHistoryEntry(this.project);
    };

    drawPreview (ctx) {
        if (this.firstCorner == null || this.lastCorner == null) {
            return;
        }


        ctx.globalAlpha = this.getSetting("transparencyAlpha") / 100;
        let color1 = this.getSetting('color1');
        let color2 = this.getSetting('color2');
        // definition of the gradient from 'from' to 'to'
        let gradient = ctx.createLinearGradient(this.firstCorner.x, this.firstCorner.y,
                                                this.lastCorner.x, this.lastCorner.y);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;
    };
}
