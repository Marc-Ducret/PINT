import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {colorSelect} from "../image_utils/connexComponent";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";
import {ActionInterface} from "./actionInterface";
import {Layer} from "../ui/layer";

/**
 * 'Magic wand' automatic selection tool, selects the connex component of the picture containing the clicked position.
 */
export class AutoSelectTool extends Tool {
    readonly overrideSelectionMask: boolean = true;

    /**
     * Instantiates the Tool with AutoSelectTool name.
     */
    constructor () {
        super("AutoSelectTool", "Magic wand");
        this.addSetting({name: "wand_threshold", descName: "Threshold", inputType: InputType.Number, defaultValue: 50});
        this.addSetting({name: "project_selection", descName: "", inputType: InputType.Special, defaultValue: 0});
    }

    reset() {}

    /**
     * On click, computes the connex component and update selection.
     * @param {ImageData} img Content of the drawing canvas.
     * @param {Vec2} pos Click position
     * @param {Project} project Document state
     */
    startUse(img: ImageData, pos: Vec2) {
        this.data = colorSelect(img, new Vec2(Math.floor(pos.x), Math.floor(pos.y)), this.getSetting("wand_threshold")).buffer;
    };

    endUse (pos) {};

    continueUse (pos) {};

    drawPreview(layer: Layer) {
        let selection = this.getSetting("project_selection");
        selection.reset();
        selection.addRegion(new Uint8ClampedArray(this.data, 0));
        selection.updateBorder();
    };

    async applyTool(layer: Layer): Promise<HistoryEntry> {
        this.drawPreview(layer);
        return new HistoryEntry(() => {}, () => {}, {});
    }
}
