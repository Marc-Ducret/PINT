import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {Layer} from "../ui/layer";
import {ActionInterface} from "./actionInterface";

/**
 * Copy tool.
 */
export class CopyTool extends Tool {
    private updated: boolean = false;

    constructor() {
        super("CopyTool", "Copy", "c");

        this.addSetting({name: "project_clipboard", descName: "Clipboard", inputType: InputType.Hidden, defaultValue: ""});
        this.addSetting({name: "project_clipboard_x", descName: "Clipboard X", inputType: InputType.Hidden, defaultValue: 0});
        this.addSetting({name: "project_clipboard_y", descName: "Clipboard Y", inputType: InputType.Hidden, defaultValue: 0});

        this.addSetting({name: "project_selection", descName: "", inputType: InputType.Special, defaultValue: 0});
        this.addSetting({name: "user_interface", descName: "", inputType: InputType.Special, defaultValue: 0});
    }

    reset () {
        this.updated = false;
    }

    startUse(img: ImageData, pos: Vec2) {
        this.data = {};

    };

    continueUse(pos: Vec2) {};
    endUse(pos: Vec2) {
        this.data = pos;

        let layer: Layer = this.getSetting("user_interface").project.currentLayer.clone();
        layer.applyMask(this.getSetting("project_selection"));

        this.setSetting("project_clipboard", layer.getHTMLElement().toDataURL());
        this.setSetting("project_clipboard_x", pos.x);
        this.setSetting("project_clipboard_y", pos.y);
    };

    drawPreview(layer: Layer) {};

    async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface> {
        // Can't undo a copy.
        return null;
    };
}
