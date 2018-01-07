import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Layer} from "../ui/layer";
import {ActionInterface, ActionType} from "./actionInterface";

/**
 * Paste tool
 */
export class PasteTool extends Tool {
    private ready: boolean = false;
    readonly readahead: boolean = true;

    constructor() {
        super("PasteTool", "Paste", "v");

        this.addSetting({name: "project_clipboard", descName: "Clipboard", inputType: InputType.Hidden, defaultValue: ""});
        this.addSetting({name: "project_clipboard_x", descName: "Clipboard X", inputType: InputType.Hidden, defaultValue: 0});
        this.addSetting({name: "project_clipboard_y", descName: "Clipboard Y", inputType: InputType.Hidden, defaultValue: 0});
        this.addSetting({name: "mode", descName: "Composition mode", inputType: InputType.Select, defaultValue: "source-over",
            options: [
                {name: "source-over", desc: "Source over"},
                {name: "source-in", desc: "Source in"},
                {name: "source-out", desc: "Source out"},
                {name: "source-atop", desc: "Source atop"},
                {name: "destination-over", desc: "Destination over"},
                {name: "destination-in", desc: "Destination in"},
                {name: "destination-out", desc: "Destination out"},
                {name: "destination-atop", desc: "Destination atop"},
                {name: "lighter", desc: "Lighter"},
                {name: "xor", desc: "Xor"},
                {name: "multiply", desc: "Multiply"},
                {name: "screen", desc: "Screen"},
                {name: "overlay", desc: "Overlay"},
                {name: "darken", desc: "Darken"},
                {name: "lighten", desc: "Lighten"},
                {name: "color-dodge", desc: "Color dodge"},
                {name: "color-burn", desc: "Color burn"},
                {name: "hard-light", desc: "Hard light"},
                {name: "soft-light", desc: "Soft light"},
                {name: "difference", desc: "Difference"},
                {name: "exclusion", desc: "Exclusion"},
                {name: "hue", desc: "Hue"},
                {name: "saturation", desc: "Saturation"},
                {name: "color", desc: "Color"},
                {name: "luminosity", desc: "Luminosity"}]
        });
    }

    reset () {
        this.ready = false;
    }

    startUse(img: ImageData, pos: Vec2) {
        this.data = {};

    };

    continueUse(pos) {};
    endUse(pos) {
        this.data = pos;

    };

    drawPreview(layer: Layer) {};

    async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface> {
        if (this.getSetting("project_clipboard") == "") {
            return null;
        }

        layer.getContext().save();
        layer.getContext().globalCompositeOperation = this.getSetting("mode");
        if (this.getSetting("mode") == "copy") {
            layer.reset();
        }

        await layer.drawDataUrl(
            this.getSetting("project_clipboard"),
            this.data.x - this.getSetting("project_clipboard_x"),
            this.data.y - this.getSetting("project_clipboard_y"));

        layer.getContext().restore();
        return {
            type: ActionType.ToolApplyHistory,
            toolName: "PasteTool",
            actionData: {},
            toolSettings: {}
        };
    };
}

