/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";

/**
 * Hand tool, allows the user to translate the canvas in the viewport.
 */
export class HandTool extends Tool {
    firstCorner: Vec2;
    lastCorner: Vec2;
    project: Project;

    constructor() {
        super("HandTool", "Move");
    }

    /**
     * Reset tool data.
     */
    reset () {
        this.firstCorner = null;
        this.lastCorner = null;
    }

    /**
     * Save positions as global coordinates.
     * @param {ImageData} img Ignored
     * @param {Vec2} pos Starting position in local coordinates.
     * @param {Project} project Saved in order to compute global coordinates.
     */
    startUse(img: ImageData, pos: Vec2, project: Project) {
        this.firstCorner = project.getUI().viewport.localToGlobalPosition(pos);
        this.lastCorner = project.getUI().viewport.localToGlobalPosition(pos);
        this.project = project;
    };

    /**
     * Update last position.
     * @param {Vec2} pos Position in local coordinates.
     */
    continueUse(pos) {
        this.firstCorner = this.lastCorner;
        this.lastCorner = this.project.getUI().viewport.localToGlobalPosition(pos);
    };

    /**
     * Update last position
     * @param {Vec2} pos Position in local coordinates.
     * @returns {boolean}
     */
    endUse(pos) {
        this.continueUse(pos);
        return false;
    };

    /**
     * It's not really a preview, it applies the translation.
     * @param {CanvasRenderingContext2D} ctx Ignored
     */
    drawPreview(ctx) {
        if (this.firstCorner == null || this.lastCorner == null) {
            return;
        }
        this.project.getUI().translate(this.lastCorner.subtract(this.firstCorner, true));
    };
}
