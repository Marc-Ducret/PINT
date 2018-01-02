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

    constructor() {
        super("PasteTool", "Paste", "v");

        this.addSetting({name: "project_clipboard", descName: "Clipboard", inputType: InputType.Hidden, defaultValue: ""});
        this.addSetting({name: "project_clipboard_x", descName: "Clipboard X", inputType: InputType.Hidden, defaultValue: 0});
        this.addSetting({name: "project_clipboard_y", descName: "Clipboard Y", inputType: InputType.Hidden, defaultValue: 0});
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
        console.log("let's work");

        await layer.drawDataUrl(
            this.getSetting("project_clipboard"),
            this.data.x - this.getSetting("project_clipboard_x"),
            this.data.y - this.getSetting("project_clipboard_y"));

        console.log("done.");

        return {
            type: ActionType.ToolApplyHistory,
            toolName: "PasteTool",
            actionData: {},
            toolSettings: {}
        };
    };
}

