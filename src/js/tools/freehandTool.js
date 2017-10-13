FreehandTool.prototype = new Tool("FreehandTool");

/**
 * A freehand drawing tool
 */
 function FreehandTool() {
    this.positions = [];
    this.settings = new SettingsRequester();
    this.settings.add({name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#000000"});
    this.settings.add({name: "lineWidth", descName: "Stroke width", inputType: "number", defaultValue: "5"});

    this.startUse = function(img, pos) {
        this.image = img;
        this.used = true;
        this.continueUse(pos);
    };

    this.endUse = function(pos) {
        this.used = false;
        this.positions = [];
        return null;
    };

    this.continueUse = function(pos) {
        if(this.used) {
            this.positions.push(pos);
        }
    };

    this.drawPreview = function(ctx) {
    ctx.beginPath();
    for (var i = 0; i < this.positions.length; i++) {
        var pos = this.positions[i];
        if(i === 0) {
            ctx.moveTo(pos.x, pos.y);
        } else {
            ctx.lineTo(pos.x, pos.y);
        }
    }
    ctx.lineWidth = this.settings.lineWidth;
    ctx.strokeStyle = this.settings.strokeColor;
    ctx.stroke();
    };
}

$(function() {
    registerTool(new FreehandTool());
});
