/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";

/**
 * Shape selection tool, allows the user to add a shape to current selection.
 */
export class HandTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;
    project: Project;

    constructor() {
        super("HandTool", "Move");
    }

    reset () {
        this.firstCorner = null;
        this.lastCorner = null;
    }

    startUse(img: ImageData, pos: Vec2, project: Project) {
        this.firstCorner = project.getUI().viewport.localToGlobalPosition(pos);
        this.lastCorner = project.getUI().viewport.localToGlobalPosition(pos);
        this.project = project;
    };

    continueUse(pos) {
        this.firstCorner = this.lastCorner;
        this.lastCorner = this.project.getUI().viewport.localToGlobalPosition(pos);
    };

    endUse(pos) {
        this.continueUse(pos);
        return false;
    };

    drawPreview(ctx) {
        if (this.firstCorner == null || this.lastCorner == null) {
            return;
        }
        this.project.getUI().translate(this.lastCorner.subtract(this.firstCorner, true));
    };
}
