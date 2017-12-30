/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";
import {Layer} from "../ui/layer";

/**
 * Shape selection tool, allows the user to add a shape to current selection.
 */
export class CopyTool extends Tool {
    private updated: boolean = false;

    constructor() {
        super("CopyTool", "Copy");

        this.addSetting({name: "project_clipboard", descName: "Clipboard", inputType: InputType.String, defaultValue: ""});
        this.addSetting({name: "project_clipboard_x", descName: "Clipboard X", inputType: InputType.Number, defaultValue: 0});
        this.addSetting({name: "project_clipboard_y", descName: "Clipboard Y", inputType: InputType.Number, defaultValue: 0});

        this.addSetting({name: "user_interface", descName: "", inputType: InputType.Special, defaultValue: 0});
    }

    reset () {
        this.updated = false;
    }

    startUse(img: ImageData, pos: Vec2) {
        this.data = {};

    };

    continueUse(pos) {};
    endUse(pos) {
        this.data = pos;

        let layer = this.getSetting("user_interface").project.currentLayer;
        this.setSetting("project_clipboard", layer.getHTMLElement().toDataURL());
        this.setSetting("project_clipboard_x", pos.x);
        this.setSetting("project_clipboard_y", pos.y);
    };

    drawPreview(layer: Layer) {};

    applyTool(layer: Layer): HistoryEntry {
        return new HistoryEntry(()=>{},()=>{}, []);
    };
}
