import {Tool} from "./tool";
import {InputType} from "../tool_settings/settingsRequester";
import {ActionInterface, ActionType} from "./actionInterface";
import {Layer} from "../ui/layer";
import {Vec2} from "../vec2";

/**
 * Pick a color and put it into strokeColor or fillColor.
 */
export class EyedropperTool extends Tool {
    private img: ImageData;

    constructor () {
        super("EyedropperTool", "Select color from the canvas", ""/*TODO shortcut*/);
        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "fillColor", descName: "Fill color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "colorSetting", descName: "Color to select", inputType: InputType.Select, defaultValue: "strokeColor",
            options: [{name: "strokeColor", desc: "Stroke color"},
                {name: "fillColor", desc: "Fill color"}]});
    }

    reset () {}

    startUse (img: ImageData, pos: Vec2) {
        this.img = img;
        this.continueUse(pos);
    }

    continueUse (pos: Vec2) {
        let img = this.img;
        let intToRGB = function(i: number){
            var c = (i & 0x00FFFFFF)
                .toString(16)
                .toUpperCase();

            return "00000".substring(0, 6 - c.length) + c;
        };
        let colorOf = function(x: number, y: number) {
            x = Math.floor(x);
            y = Math.floor(y);
            let i = img.width * y + x;
            let col = img.data[i * 4 + 0] << 16;
            col +=    img.data[i * 4 + 1] <<  8;
            col +=    img.data[i * 4 + 2] <<  0;
            return '#' + intToRGB(col);
        };
        var color = colorOf(pos.x, pos.y);
        this.setSetting(this.getSetting("colorSetting"), color);
        if(this.icon != null) {
            this.icon.setAttribute("style", "color: "+color);
        }
    }

    endUse (pos: Vec2) {
        this.continueUse(pos);
        this.icon.removeAttribute("style");
    }

    drawPreview(layer: Layer) {
    }

    async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface> {
        return null;
    }
}
