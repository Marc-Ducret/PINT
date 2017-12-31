/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";
import {Layer} from "../ui/layer";

/**
 * Shape selection tool, allows the user to add a shape to current selection.
 */
export class SelectionTool extends Tool {
    readonly overrideSelectionMask: boolean = true;

    constructor() {
        super("SelectionTool", "Selection");

        this.addSetting({
            name: "shape", descName: "Shape", inputType: InputType.Select, defaultValue: "square",
            options: [{name: "square", desc: "Square"},
                {name: "circle", desc: "Circle"}]
        });
        this.addSetting({name: "project_selection", descName: "", inputType: InputType.Special, defaultValue: 0});
    }

    reset () {}

    startUse(img: ImageData, pos: Vec2) {
        this.data = {
            firstCorner: pos,
            lastCorner: pos,
            width: img.width,
            height: img.height,
        };
    };

    continueUse(pos) {
        this.data.lastCorner = pos;
    };

    endUse(pos) {
        this.continueUse(pos);
    };

    drawPreview(layer: Layer) {
        let context = layer.getContext();
        context.strokeStyle = '#000';
        context.lineWidth = 1;

        let firstCorner = new Vec2(this.data.firstCorner.x, this.data.firstCorner.y);
        let lastCorner = new Vec2(this.data.lastCorner.x, this.data.lastCorner.y);

        switch (this.getSetting("shape")) {
            case "square":
                context.beginPath();
                let x = Math.min(firstCorner.x, lastCorner.x),
                    y = Math.min(firstCorner.y, lastCorner.y),
                    w = Math.abs(firstCorner.x - lastCorner.x),
                    h = Math.abs(firstCorner.y - lastCorner.y);

                context.rect(x, y, w, h);
                context.stroke();
                break;
            case "circle":
                context.beginPath();
                let center = firstCorner;
                let radius = center.distance(lastCorner);
                context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
                context.stroke();
                break;
            case "ellipse":
                let xdep = lastCorner.x / 2 + firstCorner.x / 2,
                    ydep = lastCorner.y / 2 + firstCorner.y / 2,
                    xlen = Math.abs(lastCorner.x / 2 - firstCorner.x / 2),
                    ylen = Math.abs(lastCorner.y / 2 - firstCorner.y / 2);
                context.beginPath();
                context.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                context.stroke();
                break;
            default:
                console.error("No shape selected.");
                break;
        }
    };

    async applyTool(layer: Layer): Promise<HistoryEntry> {
        let width = this.data.width;
        let height = this.data.height;

        let firstCorner = new Vec2(this.data.firstCorner.x, this.data.firstCorner.y);
        let lastCorner = new Vec2(this.data.lastCorner.x, this.data.lastCorner.y);

        let selection = new Uint8ClampedArray(width * height);
        switch (this.getSetting("shape")) {
            case "square":
                for (let y = Math.floor(Math.min(firstCorner.y, lastCorner.y)); y < Math.max(firstCorner.y, lastCorner.y); y++) {
                    for (let x = Math.floor(Math.min(firstCorner.x, lastCorner.x)); x < Math.max(firstCorner.x, lastCorner.x); x++) {
                        if(x >= 0 && y >= 0 && x < width && y < height) {
                            selection[x + y * width] = 0xFF;
                        }
                    }
                }
                break;
            case "circle":
                let radius = Math.ceil(firstCorner.distance(lastCorner));
                for (let y = Math.floor(firstCorner.y - radius) - 2; y <= firstCorner.y + radius + 2; y++) {
                    for (let x = Math.floor(firstCorner.x - radius) - 2; x <= firstCorner.x + radius + 2; x++) {
                        if(x >= 0 && x < width && y >= 0 && y < height) {
                            let d = (x - firstCorner.x - .5) ** 2 + (y - firstCorner.y  - .5) ** 2;
                            if(d <= radius ** 2) {
                                selection[x + y * width] = 0xFF;
                            } else if(d <= (radius + 1) ** 2) {
                                selection[x + y * width] = Math.floor(0x100 * (radius + 1 - Math.sqrt(d)));
                            }
                        }
                    }
                }
                break;
            case "ellipse":
                break;
            case "arbitrary":
                break;
            default:
                console.error("No shape selected.");
                break;
        }
        this.getSetting('project_selection').reset();
        this.getSetting('project_selection').addRegion(selection);
        this.getSetting('project_selection').updateBorder();

        return new HistoryEntry(()=>{},()=>{}, []);
    }
}
