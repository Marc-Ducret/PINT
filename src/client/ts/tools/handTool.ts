/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {HistoryEntry} from "../history/historyEntry";
import {InputType} from "../tool_settings/settingsRequester";
import {Layer} from "../ui/layer";

/**
 * Hand tool, allows the user to translate the canvas in the viewport.
 */
export class HandTool extends Tool {
    constructor() {
        super("HandTool", "Move", "h");

        this.addSetting({name: "user_interface", descName: "", inputType: InputType.Special, defaultValue: 0});
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
        let data = {
            firstCorner: this.getSetting("user_interface").viewport.localToGlobalPosition(pos),
            lastCorner: this.getSetting("user_interface").viewport.localToGlobalPosition(pos),
        };

        this.data = {
            fcx: data.firstCorner.x,
            fcy: data.firstCorner.y,
            lcx: data.lastCorner.x,
            lcy: data.lastCorner.y,
        }
    };

    /**
     * Update last position.
     * @param {Vec2} pos Position in local coordinates.
     */
    continueUse(pos) {
        this.data.fcx = this.data.lcx;
        this.data.fcy = this.data.lcy;
        let lc = this.getSetting("user_interface").viewport.localToGlobalPosition(pos);
        this.data.lcx = lc.x;
        this.data.lcy = lc.y;
    };

    /**
     * Update last position
     * @param {Vec2} pos Position in local coordinates.
     * @returns {boolean}
     */
    endUse(pos) {
        this.continueUse(pos);
    };

    /**
     * It's not really a preview, it applies the translation.
     * @param {CanvasRenderingContext2D} layer Ignored
     */
    drawPreview(layer: Layer) {
        this.getSetting("user_interface").translate(new Vec2(this.data.lcx - this.data.fcx, this.data.lcy - this.data.fcy));
    };

    async applyTool(layer: Layer): Promise<HistoryEntry> {
        this.drawPreview(layer);
        return new HistoryEntry(()=>{},()=>{}, []);
    }
}
