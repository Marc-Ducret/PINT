/**
 * A freehand drawing tool
 */
import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";

/**
 * Freehand drawing tool.
 */
export class FreehandTool extends Tool {
    positions: Array<Vec2> = [];

    /**
     * Instantiates the tool with name FreehandTool.
     * Takes two settings: stroke color and line width.
     */
    constructor() {
        super("FreehandTool", "Pencil");

        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Stroke width", inputType: InputType.Number, defaultValue: "5"});

    }

    /**
     * Reset tool data.
     */
    reset () {
        this.positions = [];
    }

    /**
     * Starting from a reset state, ignore parameters and add the first mouse position to position table.
     * @param {ImageData} img Ignored.
     * @param {Vec2} pos Mouse position.
     * @param {Project} project Ignored.
     */
    startUse (img, pos, project) {
        this.continueUse(pos);
    };

    /**
     * Last mouse event handler. Just aggregate the data.
     * @param {Vec2} pos Mouse position
     * @returns {any} null means redraw according to the preview canvas.
     */
    endUse (pos) {
        this.continueUse(pos);
        return null;
    };

    /**
     * If given position is not too close from the last position, aggregate position into the position table.
     * @param {Vec2} pos Mouse position
     */
    continueUse (pos) {
        if(this.positions.length == 0 || pos.distance(this.positions[this.positions.length-1]) > 0) {
            this.positions.push(pos);
        }
    };

    /**
     * Rendering using canvas features.
     * @param {CanvasRenderingContext2D} ctx Canvas context.
     */
    drawPreview (ctx) {
        ctx.beginPath();
        for (let i = 0; i < this.positions.length; i++) {
            let pos = this.positions[i];
            if(i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.lineWidth = this.getSetting("lineWidth");
        ctx.strokeStyle = this.getSetting("strokeColor");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
    };
}
