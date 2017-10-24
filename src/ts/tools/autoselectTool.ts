import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {colorSelect} from "../image_utils/connexComponent";
import {PixelSelection} from "../selection/selection";

export class AutoSelectTool extends Tool {
    image: ImageData;
    used: boolean;
    selection: PixelSelection;
    border: Array<Vec2>;

    constructor () {
        super("AutoSelectTool");
    }

    startUse(img: ImageData, pos: Vec2, project: Project) {
        this.image = img;
        this.used = true;
        project.currentSelection.reset();
        project.currentSelection.addRegion(colorSelect(this.image, new Vec2(Math.floor(pos.x), Math.floor(pos.y))));
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
