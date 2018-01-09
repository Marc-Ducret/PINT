import {Tool} from "./tool";
import {InputType} from "../tool_settings/settingsRequester";
import {ActionInterface, ActionType} from "./actionInterface";
import {Layer} from "../ui/layer";
import {Vec2} from "../vec2";

/**
 * Draw a line tool.
 */
export class LineTool extends Tool {
    constructor() {
        super("LineTool", "Line", "l");
        this.addSetting({
            name: "strokeColor",
            descName: "Stroke color",
            inputType: InputType.Color,
            defaultValue: "#000000"
        });
        this.addSetting({
            name: "strokeAlpha",
            descName: "Stroke transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name: "maxValue", desc: "100"},
                {name: "minValue", desc: "0"}
            ]
        });
        this.addSetting({name: "lineWidth", descName: "Line width", inputType: InputType.Number, defaultValue: "5"});
    }

    reset() {
    }

    startUse(img: ImageData, pos: Vec2) {
        this.data = {
            firstCorner: pos,
            lastCorner: pos,
        };
    }

    continueUse(pos: Vec2) {
        this.data.lastCorner = pos;
    }

    endUse(pos: Vec2) {
        this.continueUse(pos);
    }

    drawPreview(layer: Layer) {
        let context = layer.getContext();
        context.globalAlpha = this.getSetting("strokeAlpha") / 100;
        context.strokeStyle = this.getSetting('strokeColor');
        context.lineWidth = this.getSetting('lineWidth');
        context.beginPath();
        context.moveTo(this.data.firstCorner.x + 0.5, this.data.firstCorner.y + 0.5);
        context.lineTo(this.data.lastCorner.x + 0.5, this.data.lastCorner.y + 0.5);
        context.stroke();
        context.globalAlpha = 1;
    }

    async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface> {
        this.drawPreview(layer);

        if (generate_undo) {
            return {
                type: ActionType.ToolApplyHistory,
                toolName: "PasteTool",
                actionData: {},
                toolSettings: {}
            };
        } else {
            return null;
        }
    }
}
