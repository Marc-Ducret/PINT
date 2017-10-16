import {Tool} from "./tool";
import {Vec2} from "../vec2";
import {computeBorder, drawSelection} from "../selection/selectionDisplayTest";

function colorSelect(img: ImageData, pos: Vec2): Array<number> {
    let w = img.width;
    let h = img.height;
    let toVisit = [pos];
    let selection = [];
    for (var i = 0; i < w*h; i++) {
        selection.push(-1);
    }
    let id = function(p) {
        return p[0] + w * p[1];
    };
    let color = function(i) {
        let c = img.data[i * 4 + 2] << 8
            +   img.data[i * 4 + 1] << 4
            +   img.data[i * 4 + 0] << 0;
        return c;
    };
    let addNeighbour = function(p) {
        if(p[0] >= 0 && p[0] < w && p[1] >=0 && p[1] < h) {
            toVisit.push(p);
        }
    };
    let colorToMatch = color(id(pos));
    console.log('tovisit: ', toVisit);
    while(toVisit.length > 0) {
        let p = toVisit.pop();
        let i = id(p);
        if(selection[i] < 0) {
            if(color(i) == colorToMatch) {
                selection[i] = 1;
                addNeighbour([p[0]+1, p[1]+0]);
                addNeighbour([p[0]-1, p[1]+0]);
                addNeighbour([p[0]+0, p[1]+1]);
                addNeighbour([p[0]+0, p[1]-1]);
            } else {
                selection[i] = 0;
            }
        }
    }
    return selection;
}

export class AutoSelectTool extends Tool {
    image: ImageData;
    used: boolean;
    selection: Array<number>;
    border: Array<Vec2>;

    constructor () {
        super("AutoSelectTool");
    }

    startUse (img, pos) {
        this.image = img;
        this.used = true;
        this.selection = colorSelect(this.image, new Vec2(Math.floor(pos.x), Math.floor(pos.y)));
        this.border = computeBorder(this.selection, this.image.width, this.image.height);
        console.log('border length: ', this.border.length);
    };

    endUse (pos) {
        this.used = false;
        return false;
    };

    continueUse (pos) {
    };

    drawPreview (ctx: CanvasRenderingContext2D) {
        drawSelection(this.border, ctx, this.image.width, this.image.height);
    };
}
