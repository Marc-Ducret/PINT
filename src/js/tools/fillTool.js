FillTool.prototype = new Tool("FillTool");

/**
 * Fill all pixels with a single color
 */
 function FillTool() {
    this.positions = [];
    this.settings = new SettingsRequester();
    this.settings.add({name: "fillColor", descName: "Fill color", inputType: "color", defaultValue: "#000000"});

    this.startUse = function(img, pos) {
    };

    this.endUse = function(pos) {
        return null;
    };

    this.continueUse = function(pos) {
    };

    this.drawPreview = function(ctx) {
    ctx.fillStyle = this.settings.fillColor;
    ctx.beginPath();

    var x = 0,
        y = 0,
        w = ctx.canvas.width,
        h = ctx.canvas.height;
    ctx.rect(x,y,w,h);
    ctx.fill();
    ctx.stroke();
    };
}

$(function() {
    registerTool(new FillTool());
});
