function isSelected(selection, x, y, w, h) {
    return x >= 0 && x < w && y >= 0 && y < h && selection[x + y * w] > 0;
}

function computeBorder(selection, w, h) {
    border = [];
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if(!isSelected(selection, x, y, w, h)
            && (isSelected(selection, x-1, y+0, w, h)
            ||  isSelected(selection, x+0, y-1, w, h)
            ||  isSelected(selection, x+1, y+0, w, h)
            ||  isSelected(selection, x+0, y+1, w, h))) {
                border.push([x, y]);
            }
        }
    }
    return border;
}

var w = 800
var h = 600

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

function drawSelection(border, ctx, w, h) {
    var img = ctx.getImageData(0, 0, w, h);

    var pattern = 10;
    var period = 500;
    var offset = (Date.now() % period) * pattern * 2 / period;
    for (var i in border) {
        var x = border[i][0];
        var y = border[i][1];
        if(((x + y + offset) / pattern) % 2 < 1) continue;
        img.data[(x + y * w) * 4] = 0x0;
        img.data[(x + y * w) * 4 + 3] = 0xFF;
    }

    ctx.putImageData(img, 0, 0);
}
