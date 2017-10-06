ShapeTool.prototype = new Tool("ShapeTool");
function ShapeTool() {
    this.settings = new SettingsRequester();
    this.settings.add({name: "strokeColor", descName: "Primary color", inputType: "color", defaultValue: "#ffffff"});
    this.settings.add({name: "fillColor", descName: "Secondary color", inputType: "color", defaultValue: "#000000"});
    this.settings.add({name: "lineWidth", descName: "Line width", inputType: "number", defaultValue: "5"});
    this.settings.add({name: "shape", descName: "Shape", inputType: "options", defaultValue: "square",
                        values: {square: "Square",
                                 circle: "Circle",
                                 ellipse: "Ellipse"}});


    this.startUse = function(img, pos) {
        this.firstCorner = pos;
        this.lastCorner = pos;
    };

    this.continueUse = function(pos) {
        this.lastCorner = pos;
    };

    this.endUse = function(pos) {
        this.continueUse(pos);
        return null;
    };

    this.drawPreview = function(ctx) {
        ctx.fillStyle = this.settings.fillColor;
        ctx.strokeStyle = this.settings.strokeColor;
        ctx.lineWidth = this.settings.lineWidth;

        switch (this.settings.shape) {
            case "square":
                ctx.beginPath();
                var x = Math.min(this.firstCorner.x, this.lastCorner.x),
                    y = Math.min(this.firstCorner.y, this.lastCorner.y),
                    w = Math.abs(this.firstCorner.x - this.lastCorner.x),
                    h = Math.abs(this.firstCorner.y - this.lastCorner.y);
                ctx.rect(x,y,w,h);
                ctx.fill();
                ctx.stroke();
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(this.firstCorner.x, this.firstCorner.y, this.firstCorner.distance(this.lastCorner), 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.stroke();
                break;
            case "ellipse":
                var xdep = this.lastCorner.x/2 + this.firstCorner.x/2,
                    ydep = this.lastCorner.y/2 + this.firstCorner.y/2,
                    xlen = Math.abs(this.lastCorner.x/2 - this.firstCorner.x/2),
                    ylen = Math.abs(this.lastCorner.y/2 - this.firstCorner.y/2);
                ctx.beginPath();
                ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
            default:
                console.error("No shape selected.");
                break;
        }

    };
}



$(function() {
    registerTool(new ShapeTool());
});
