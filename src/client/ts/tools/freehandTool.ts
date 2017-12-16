/**
 * A freehand drawing tool
 */
import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";
import {Project} from "../docState";
import {Layer} from "../ui/layer";
import {ActionInterface} from "../../../common/actionInterface";

/**
 * Freehand drawing tool.
 */
export class FreehandTool extends Tool {
    /**
     * Instantiates the tool with name FreehandTool.
     * Takes two settings: stroke color and line width.
     */
    constructor() {
        super("FreehandTool", "Pencil");

        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({
            name: "strokeAlpha",
            descName: "Stroke transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name:"maxValue", desc: "100"},
                {name:"minValue", desc: "0"}
            ]});
        this.addSetting({name: "lineWidth", descName: "Stroke width", inputType: InputType.Number, defaultValue: "5"});
    }

    /**
     * Reset tool data.
     */
    reset () {}

    /**
     * Starting from a reset state, ignore parameters and add the first mouse position to position table.
     * @param {ImageData} img Ignored.
     * @param {Vec2} pos Mouse position.
     * @param {Project} project Ignored.
     */
    startUse (img, pos) {
        this.data.actionData = {
            positions: [],
        };

        this.continueUse(pos);
    };

    /**
     * Last mouse event handler. Just aggregate the data.
     * @param {Vec2} pos Mouse position
     * @returns {any} null means redraw according to the preview canvas.
     */
    endUse (pos): ActionInterface {
        this.continueUse(pos);
        return this.data;
    };

    /**
     * If given position is not too close from the last position, aggregate position into the position table.
     * @param {Vec2} pos Mouse position
     */
    continueUse (pos) {
        let n_elem = this.data.actionData.positions.length;
        if(n_elem == 0
            || pos.distance(this.data.actionData.positions[n_elem - 1]) > 0)
        {
            this.data.actionData.positions.push(pos);
        }
    };

    /**
     * Rendering using canvas features.
     * @param {CanvasRenderingContext2D} ctx Canvas context.
     */
    drawPreview (ctx) {
        ctx.globalAlpha = this.getSetting("strokeAlpha") / 100;
        ctx.lineWidth = this.getSetting("lineWidth");
        ctx.strokeStyle = this.getSetting("strokeColor");
        ctx.fillStyle = this.getSetting("strokeColor");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (this.data.actionData.positions.length > 0) {
            ctx.fillRect(this.data.actionData.positions[0].x-0.5,this.data.actionData.positions[0].y-0.5,1,1);
        }
        ctx.beginPath();
        for (let i = 0; i < this.data.actionData.positions.length; i++) {
            let pos = this.data.actionData.positions[i];
            if(i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }

        ctx.stroke();
        ctx.globalAlpha = 1;
    };

    applyTool(context: CanvasRenderingContext2D): HistoryEntry {
        this.drawPreview(context);
        return new HistoryEntry(() => {}, () => {}, {});
    }

}
