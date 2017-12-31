import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";
import {Layer} from "../ui/layer";

/**
 * Paste tool
 */
export class PasteTool extends Tool {
    private ready: boolean = false;

    constructor() {
        super("PasteTool", "Paste");

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

    async applyTool(layer: Layer): Promise<HistoryEntry> {
        await layer.drawDataUrl(
            this.getSetting("project_clipboard"),
            this.data.x - this.getSetting("project_clipboard_x"),
            this.data.y - this.getSetting("project_clipboard_y"));

        return new HistoryEntry(()=>{},()=>{}, []);
    };
}

