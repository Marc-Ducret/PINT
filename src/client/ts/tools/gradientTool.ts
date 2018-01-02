import {Tool} from "./tool";
import {InputType} from "../tool_settings/settingsRequester";
import {ActionInterface, ActionType} from "./actionInterface";
import {Layer} from "../ui/layer";

/**
 * Draw a linear gradient of two colors.
 */
export class GradientTool extends Tool {
    constructor () {
        super("GradientTool", "Gradient", "g");
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

    endUse (pos) {
        this.continueUse(pos);
    };

    drawPreview(layer: Layer) {
        let context = layer.getContext();
        context.globalAlpha = this.getSetting('transparencyAlpha') / 100;

        let gradient = context.createLinearGradient(this.data.firstCorner.x, this.data.firstCorner.y,
                                                this.data.lastCorner.x, this.data.lastCorner.y);
        gradient.addColorStop(0, this.getSetting('color1'));
        gradient.addColorStop(1, this.getSetting('color2'));
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.data.width, this.data.height);
        context.globalAlpha = 1;
    };

    async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface> {
        if (generate_undo) {
            let old_layer = layer.clone();
            this.drawPreview(layer);

            old_layer.mask(layer);
            return {
                type: ActionType.ToolApply,
                toolName: "PasteTool",
                actionData: null,
                toolSettings:
                    {
                        project_clipboard: old_layer.getHTMLElement().toDataURL(),
                        project_clipboard_x: 0,
                        project_clipboard_y: 0,
                    }
            };
        } else {
            this.drawPreview(layer);
            return null;
        }
    }
}
