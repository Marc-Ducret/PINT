import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {colorSelect} from "../image_utils/connexComponent";
import {InputType} from "../tool_settings/settingsRequester";

/**
 * 'Magic wand' automatic selection tool, selects the connex component of the picture containing the clicked position.
 */
export class AutoSelectTool extends Tool {
    image: ImageData;
    used: boolean;
    selection: Uint8ClampedArray;
    border: Array<Vec2>;
    readonly overrideSelectionMask: boolean = true;

    /**
     * Instantiates the Tool with AutoSelectTool name.
     */
    constructor () {
        super("AutoSelectTool", "Magic wand");
        this.addSetting({name: "threshold", descName: "Threshold", inputType: InputType.Number, defaultValue: 0});
    }

    /**
     * Reset tool data.
     */
    reset() {
        this.image = null;
        this.used = false;
        this.selection = null;
        this.border = null;
    }

    /**
     * On click, computes the connex component and update selection.
     * @param {ImageData} img Content of the drawing canvas.
     * @param {Vec2} pos Click position
     * @param {Project} project Document state
     */
    startUse(img: ImageData, pos: Vec2, project: Project) {
        this.image = img;
        this.used = true;
        project.currentSelection.reset();
        project.currentSelection.addRegion(colorSelect(this.image, new Vec2(Math.floor(pos.x), Math.floor(pos.y)), this.getSetting("threshold")));
        project.currentSelection.updateBorder();
    };

    endUse (pos) {
        this.used = false;
        return false;
    };

    continueUse (pos) {
    };

    drawPreview (ctx: CanvasRenderingContext2D) {
    };
}
