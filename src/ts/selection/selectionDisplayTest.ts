import {Vec2} from "../vec2";

function isSelected(selection, x, y, w, h) {
    return x >= 0 && x < w && y >= 0 && y < h && selection[x + y * w] > 0;
}

export function computeBorder(selection: Array<number>, w: number, h: number) : Array<Vec2> {
    let border: Array<Vec2> = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if(!isSelected(selection, x, y, w, h)
            && (isSelected(selection, x-1, y+0, w, h)
            ||  isSelected(selection, x+0, y-1, w, h)
            ||  isSelected(selection, x+1, y+0, w, h)
            ||  isSelected(selection, x+0, y+1, w, h))) {
                border.push(new Vec2(x, y));
            }
        }
    }
    return border;
}

var w = 800; // TODO: Don't hardcode that.
var h = 600;

var selection = [];
for (var i = 0; i < w * h; i ++) {
    selection.push(0);
}

for (var i = 0; i < 100; i ++) {
    for (var j = 0; j < 100; j ++) {
        selection[100 + i + (100 + j) * w] = 1;
    }
}
for (var i = 0; i < 100; i ++) {
    for (var j = 0; j < 100; j ++) {
        selection[150 + i + (125 + j) * w] = 1;
    }
}

var borderSel = computeBorder(selection, w, h);

export function drawSelection(border: Array<Vec2>, ctx: CanvasRenderingContext2D, w: number, h: number) {
    var img = ctx.getImageData(0, 0, w, h);

    var pattern = 10;
    var period = 500;
    var offset = (Date.now() % period) * pattern * 2 / period;
    for (var i in border) {
        var x = border[i].x;
        var y = border[i].y;
        if(((x + y + offset) / pattern) % 2 < 1) continue;
        img.data[(x + y * w) * 4] = 0x0;
        img.data[(x + y * w) * 4 + 3] = 0xFF;
    }

    ctx.putImageData(img, 0, 0);
}
