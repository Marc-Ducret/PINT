/**
 * Fill all pixels with a single color
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";

import {InputType} from "../tool_settings/settingsRequester";
import {colorSelect} from "../image_utils/connexComponent";
import {Project} from "../docState";
import {ActionInterface} from "./actionInterface";
import {HistoryEntry} from "../history/historyEntry";

/**
 * Fill a connex component tool.
 */
export class FillTool extends Tool {
    newImage: ImageData;

    /**
     * Instantiate the tool with FillTool name.
     * Takes one setting, the fill color.
     */
    constructor() {
        super("FillTool", "Fill");
        this.addSetting({name: "fillColor", descName: "Fill color", inputType: InputType.Color, defaultValue: "#000000"});
        this.addSetting({
            name: "fillAlpha",
            descName: "Fill transparency",
            inputType: InputType.Range,
            defaultValue: 100,
            options: [
                {name:"maxValue", desc: "100"},
                {name:"minValue", desc: "0"}
                ]});
        this.addSetting({name: "threshold", descName: "Threshold", inputType: InputType.Number, defaultValue: 0});
        this.addSetting({name: "project_selection", descName: "", inputType: InputType.Special, defaultValue: 0});
    }

    reset () {
        this.newImage = null;
    }
    /**
     * On click, computes the connex component containing the click position and fill it with the parameter color.
     * @param {ImageData} img Content of the drawing canvas.
     * @param {Vec2} pos Click position
     * @param {Project} project Document state
     */
    startUse (img: ImageData, pos: Vec2) {
        this.reset();

        this.data = {
            pixels: colorSelect(img, new Vec2(Math.floor(pos.x), Math.floor(pos.y)), this.getSetting("threshold")).buffer,
            width: img.width,
            height: img.height,
        };
    };

    continueUse (pos) {};

    endUse (pos) {};


    drawPreview (ctx: CanvasRenderingContext2D) {
        if (this.newImage == null) {
            let selection = this.getSetting("project_selection");

            let width:number = this.data.width;
            let height: number = this.data.height;
            let color_hex: string = this.getSetting("fillColor");
            let color_alpha: number = this.getSetting("fillAlpha");

            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color_hex);
            let color = result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;

            this.newImage = ctx.createImageData(width, height);

            let pixels = new Uint8ClampedArray(this.data.pixels, 0);

            let nfilled = 0;

            for (let x=0; x<width; x++) {
                for (let y=0; y<height; y++) {
                    if (pixels[y*width+x] > 0 && selection.isSelected(new Vec2(x, y))) {
                        let alpha = selection.getSelectionIntensity(new Vec2(x, y));
                        nfilled += 1;
                        this.newImage.data[4*(y*width+x)    ] = color.r;// R
                        this.newImage.data[4*(y*width+x) + 1] = color.g;// G
                        this.newImage.data[4*(y*width+x) + 2] = color.b;// B
                        this.newImage.data[4*(y*width+x) + 3] = alpha*color_alpha/100;// A
                    }
                }
            }

            console.log("Fill tool: nfilled = "+nfilled);
        }
        ctx.putImageData(this.newImage, 0, 0);
    };


    applyTool(context: CanvasRenderingContext2D): HistoryEntry {
        this.drawPreview(context);
        return new HistoryEntry(() => {}, () => {}, {});
    }
}
