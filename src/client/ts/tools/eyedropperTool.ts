import {Tool} from "./tool";
import {InputType} from "../tool_settings/settingsRequester";
import {ActionInterface, ActionType} from "./actionInterface";
import {Layer} from "../ui/layer";

/**
 * Draw a shape tool.
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

    startUse (img, pos) {
        this.img = img;
        this.continueUse(pos);
    };

    continueUse (pos) {
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
    };

    endUse (pos) {
        this.continueUse(pos);
        this.icon.removeAttribute("style");
    };

    drawPreview(layer: Layer) {
        // let context = layer.getContext();
        // context.globalAlpha = this.getSetting("strokeAlpha") / 100;
        // context.strokeStyle = this.getSetting('strokeColor');
        // context.lineWidth = this.getSetting('lineWidth');
        // context.beginPath();
        // context.moveTo(this.data.firstCorner.x + 0.5, this.data.firstCorner.y  + 0.5);
        // context.lineTo(this.data.lastCorner.x + 0.5, this.data.lastCorner.y + 0.5);
        // context.stroke();
        // context.globalAlpha = 1;
    };

    async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface> {
        this.drawPreview(layer);

        return null;
    }
}
