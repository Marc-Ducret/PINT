/**
 * Change current selection
 * @params {Selection}
 */

import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {Project} from "../docState";
import {InputType} from "../tool_settings/settingsRequester";
import {HistoryEntry} from "../history/historyEntry";

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
    }

    reset () {}

    startUse(img: ImageData, pos: Vec2) {
        this.data.actionData = {
            firstCorner: pos,
            lastCorner: pos,
            width: img.width,
            height: img.height,
        };
    };

    continueUse(pos) {
        this.data.actionData.lastCorner = pos;
    };

    endUse(pos) {
        this.continueUse(pos);
        return this.data;
    };

    drawPreview(ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        let firstCorner = this.data.actionData.firstCorner;
        let lastCorner = this.data.actionData.lastCorner;

        switch (this.getSetting("shape")) {
            case "square":
                ctx.beginPath();
                let x = Math.min(firstCorner.x, lastCorner.x),
                    y = Math.min(firstCorner.y, lastCorner.y),
                    w = Math.abs(firstCorner.x - lastCorner.x),
                    h = Math.abs(firstCorner.y - lastCorner.y);

                ctx.rect(x, y, w, h);
                ctx.stroke();
                break;
            case "circle":
                ctx.beginPath();
                let center = firstCorner;
                let radius = center.distance(lastCorner);
                ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
                ctx.stroke();
                break;
            case "ellipse":
                let xdep = lastCorner.x / 2 + firstCorner.x / 2,
                    ydep = lastCorner.y / 2 + firstCorner.y / 2,
                    xlen = Math.abs(lastCorner.x / 2 - firstCorner.x / 2),
                    ylen = Math.abs(lastCorner.y / 2 - firstCorner.y / 2);
                ctx.beginPath();
                ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            default:
                console.error("No shape selected.");
                break;
        }
    };

    applyTool (context: CanvasRenderingContext2D): HistoryEntry {
        let width = this.data.actionData.width;
        let height = this.data.actionData.height;

        let firstCorner = this.data.actionData.firstCorner;
        let lastCorner = this.data.actionData.lastCorner;

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
