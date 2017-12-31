/**
 * A freehand drawing tool
 */
import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";
import {Project} from "../docState";
import {Layer} from "../ui/layer";
import {ActionInterface} from "./actionInterface";

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
        this.data = {
            positions: [],
        };

        this.continueUse(pos);
    };

    /**
     * Last mouse event handler. Just aggregate the data.
     * @param {Vec2} pos Mouse position
     * @returns {any} null means redraw according to the preview canvas.
     */
    endUse (pos) {
        this.continueUse(pos);
    };

    /**
     * If given position is not too close from the last position, aggregate position into the position table.
     * @param {Vec2} pos Mouse position
     */
    continueUse (pos) {
        let n_elem = this.data.positions.length;
        if(n_elem == 0
            || pos.distance(this.data.positions[n_elem - 1]) > 0)
        {
            this.data.positions.push(pos);
        }
    };

    /**
     * Rendering using canvas features.
     * @param {CanvasRenderingContext2D} layer Canvas context.
     */
    drawPreview(layer: Layer) {
        let context = layer.getContext();
        context.globalAlpha = this.getSetting("strokeAlpha") / 100;
        context.lineWidth = this.getSetting("lineWidth");
        context.strokeStyle = this.getSetting("strokeColor");
        context.fillStyle = this.getSetting("strokeColor");
        context.lineCap = "round";
        context.lineJoin = "round";

        if (this.data.positions.length > 0) {
            context.fillRect(this.data.positions[0].x-0.5,this.data.positions[0].y-0.5,1,1);
        }
        context.beginPath();
        for (let i = 0; i < this.data.positions.length; i++) {
            let pos = this.data.positions[i];
            if(i === 0) {
                context.moveTo(pos.x, pos.y);
            } else {
                context.lineTo(pos.x, pos.y);
            }
        }

        context.stroke();
        context.globalAlpha = 1;
    };

    async applyTool(layer: Layer): Promise<HistoryEntry> {
        this.drawPreview(layer);
        return new HistoryEntry(() => {}, () => {}, {});
    }

}
