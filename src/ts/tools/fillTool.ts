/**
 * Fill all pixels with a single color
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";

import {InputType} from "../tool_settings/settingsRequester";
import {colorSelect} from "../image_utils/connexComponent";
import {PixelSelection} from "../selection/selection";
import {Project} from "../docState";

export class FillTool extends Tool {

    pixels: PixelSelection;
    newImage: ImageData;

    constructor() {
        super("FillTool");
        this.addSetting({name: "fillColor", descName: "Fill color", inputType: InputType.Color, defaultValue: "#000000"});
    }

    startUse (img: ImageData, pos: Vec2, project: Project) {
        this.pixels = colorSelect(img, new Vec2(Math.floor(pos.x), Math.floor(pos.y)));

        let width: number = img.width;
        let height: number = img.height;
        let color_hex: string = this.settings.get("fillColor");

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color_hex);
        let color = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

        let data = new Uint8ClampedArray(4*width*height);

        for (let x=0; x<width; x++) {
            for (let y=0; y<height; y++) {
                if (this.pixels[y*width+x] === 1 && project.currentSelection.isSelected(new Vec2(x, y))) {
                    data[4*(y*width+x)    ] = color.r;// R
                    data[4*(y*width+x) + 1] = color.g;// G
                    data[4*(y*width+x) + 2] = color.b;// B
                    data[4*(y*width+x) + 3] = 0xFF;// A
                }
            }
        }

        this.newImage = new ImageData(data, width, height);
    };

    endUse (pos) {
        return null;
    };

    continueUse (pos) {

    };

    drawPreview (ctx: CanvasRenderingContext2D) {
        ctx.putImageData(this.newImage,0,0);
    };
}
