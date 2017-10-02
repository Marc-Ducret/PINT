CircleTool.prototype = new Tool("CircleTool");

function CircleTool() {
    this.startUse = function(img, pos) {
        this.firstCorner = pos;
        this.lastCorner = pos;
    };

    this.endUse = function(pos) {
        /*
        Should generate do() function.
         */
    };

    this.continueUse = function(pos) {
        this.lastCorner = pos;
    };

    this.drawPreview = function(ctx) {
        ctx.beginPath();
        ctx.arc(this.firstCorner.x, this.firstCorner.y, this.firstCorner.distance(this.lastCorner), 0, 2 * Math.PI, false);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.lineWidth = .5;
        ctx.strokeStyle = '#333300';
        ctx.stroke();
    };
}

EllipseTool.prototype = new Tool("EllipseTool");

function EllipseTool() {
    this.startUse = function(img, pos) {
        this.firstCorner = pos;
        this.lastCorner = pos;
    };

    this.endUse = function(pos) {
        /*
        Should generate do() function.
         */
    };

    this.continueUse = function(pos) {
        this.lastCorner = pos;
    };

    this.drawPreview = function(ctx) {
        ctx.beginPath();
        var xdep = this.lastCorner.x/2 + this.firstCorner.x/2,
            ydep = this.lastCorner.y/2 + this.firstCorner.y/2,
            xlen = Math.abs(this.lastCorner.x/2 - this.firstCorner.x/2),
            ylen = Math.abs(this.lastCorner.y/2 - this.firstCorner.y/2);

        ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.lineWidth = .5;
        ctx.strokeStyle = '#333300';
        ctx.stroke();
    };
}

$(function() {
    registerTool(new CircleTool());
    registerTool(new EllipseTool());
});
