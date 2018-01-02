import {Tool} from "./tool";
import {InputType} from "../tool_settings/settingsRequester";
import {ActionInterface, ActionType} from "./actionInterface";
import {Layer} from "../ui/layer";

/**
 * Draw a shape tool.
 */
export class LineTool extends Tool {
    constructor () {
        super("LineTool", "Line", "l");
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

    drawPreview(layer: Layer) {
        let context = layer.getContext();
        context.globalAlpha = this.getSetting("strokeAlpha") / 100;
        context.strokeStyle = this.getSetting('strokeColor');
        context.lineWidth = this.getSetting('lineWidth');
        context.beginPath();
        context.moveTo(this.data.firstCorner.x, this.data.firstCorner.y);
        context.lineTo(this.data.lastCorner.x, this.data.lastCorner.y);
        context.stroke();
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
