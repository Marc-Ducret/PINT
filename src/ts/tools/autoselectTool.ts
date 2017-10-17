import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {controller} from "../../main";

interface Coordinates {
    x: number,
    y: number,
}

/*
TODO: Put this in a class or at least in another file.
 */
export function colorSelect(img: ImageData, pos: Vec2): Uint8ClampedArray {
    "use strict";
    console.log(img);
    let w = img.width;
    let h = img.height;
    let toVisit: Array<Coordinates> = [pos];
    let selection = new Uint8ClampedArray(w*h);

    let id = function(p: Coordinates) : number {
        return Math.floor(p.x + w * p.y);
    };

    selection[id(pos)] = 3;

    let color = function(i: number): number {
        let c = (img.data[i * 4 + 2] << 16)
            +   (img.data[i * 4 + 1] << 8)
            +   (img.data[i * 4    ] << 0);
        return c;
    };


    let addNeighbour = function(p: Coordinates) {
        if(selection[id(p)] === 0 && p.x >= 0 && p.x < w && p.y >= 0 && p.y < h) {
            selection[id(p)] = 3;
            toVisit.push(p);
        }
    };
    let i = id(pos);
    console.log(img.data[i*4+1]+" | "+img.data[i*4+2]+ " | " + img.data[i*4]);

    let colorToMatch = color(id(pos));

    console.log("color to match "+colorToMatch.toString(16)+" at position "+toVisit[0].x+ " | "+toVisit[0].y);

    while(toVisit.length > 0) {
        let p: Coordinates = toVisit.pop();
        let i = id(p);

        if(selection[i] === 3) {
            if(color(i) == colorToMatch) {
                selection[i] = 1;
                addNeighbour({x: p.x + 1, y: p.y});
                addNeighbour({x: p.x - 1, y: p.y});
                addNeighbour({x: p.x, y: p.y + 1});
                addNeighbour({x: p.x, y: p.y - 1});
            } else {
                selection[i] = 2;
            }
        }
    }
    return selection;
}

export class AutoSelectTool extends Tool {
    image: ImageData;
    used: boolean;
    selection: Uint8ClampedArray;
    border: Array<Vec2>;

    constructor () {
        super("AutoSelectTool");
    }

    startUse (img, pos) {
        this.image = img;
        this.used = true;
        controller.project.currentSelection.addRegion(colorSelect(this.image, new Vec2(Math.floor(pos.x), Math.floor(pos.y))));
        controller.project.currentSelection.updateBorder();
    };

    endUse (pos) {
        this.used = false;
        return false;
    };

    continueUse (pos) {
    };

    drawPreview (ctx: CanvasRenderingContext2D) {
    };
}
