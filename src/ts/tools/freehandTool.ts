/**
 * A freehand drawing tool
 */
import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "./history/historyEntry";
import {Project} from "../docState";
import {Layer} from "../ui/layer";

/**
 * Freehand drawing tool.
 */
export class FreehandTool extends Tool {
    positions: Array<Vec2> = [];
    project: Project;

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
        this.project = project;
        this.continueUse(pos);
    };

    /**
     * Last mouse event handler. Just aggregate the data.
     * @param {Vec2} pos Mouse position
     * @returns {any} null means redraw according to the preview canvas.
     */
    endUse (pos) {
        this.continueUse(pos);
        return this.defaultHistoryEntry(this.project);
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
        ctx.lineWidth = this.getSetting("lineWidth");
        ctx.strokeStyle = this.getSetting("strokeColor");
        ctx.fillStyle = this.getSetting("strokeColor");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (this.positions.length > 0) {
            ctx.fillRect(this.positions[0].x-0.5,this.positions[0].y-0.5,1,1);
        }
        ctx.beginPath();
        for (let i = 0; i < this.positions.length; i++) {
            let pos = this.positions[i];
            if(i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.stroke();
    };
}
