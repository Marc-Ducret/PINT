/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {HistoryEntry} from "../history/historyEntry";

/**
 * Hand tool, allows the user to translate the canvas in the viewport.
 */
export class HandTool extends Tool {
    constructor() {
        super("HandTool", "Move");
    }

    /**
     * Reset tool data.
     */
    reset () {}

    /**
     * Save positions as global coordinates.
     * @param {ImageData} img Ignored
     * @param {Vec2} pos Starting position in local coordinates.
     * @param {Project} project Saved in order to compute global coordinates.
     */
    startUse(img: ImageData, pos: Vec2) {
        this.data = {
            firstCorner: this.getSetting("user_interface").viewport.localToGlobalPosition(pos),
            lastCorner: this.getSetting("user_interface").viewport.localToGlobalPosition(pos),
        }
    };

    /**
     * Update last position.
     * @param {Vec2} pos Position in local coordinates.
     */
    continueUse(pos) {
        this.data.firstCorner = this.data.lastCorner;
        this.data.lastCorner = this.getSetting("user_interface").viewport.localToGlobalPosition(pos);
    };

    /**
     * Update last position
     * @param {Vec2} pos Position in local coordinates.
     * @returns {boolean}
     */
    endUse(pos) {
        this.continueUse(pos);
        return null;
    };

    /**
     * It's not really a preview, it applies the translation.
     * @param {CanvasRenderingContext2D} ctx Ignored
     */
    drawPreview(ctx) {
        if (this.data.firstCorner == null || this.data.lastCorner == null) {
            return;
        }
        this.getSetting("user_interface").translate(this.data.lastCorner.subtract(this.data.firstCorner, true));
    };

    applyTool (context: CanvasRenderingContext2D): HistoryEntry {
        this.drawPreview(context);
        return new HistoryEntry(()=>{},()=>{}, []);
    }
}
