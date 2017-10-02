ShapeTool.prototype = Tool.prototype;
function ShapeTool(name) {
    // @todo this.name should be set up in Tool constructor.
    this.name = name;

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
    }
}


CircleTool.prototype = new ShapeTool("CircleTool");

function CircleTool() {
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

SquareTool.prototype = new ShapeTool("SquareTool");

function SquareTool() {
    this.drawPreview = function(ctx) {
        ctx.fillStyle = 'red';

        var x = Math.min(this.firstCorner.x, this.lastCorner.x),
            y = Math.min(this.firstCorner.y, this.lastCorner.y),
            w = Math.abs(this.firstCorner.x - this.lastCorner.x),
            h = Math.abs(this.firstCorner.y - this.lastCorner.y);
        ctx.fillRect(x,y,w,h);
    }
}


EllipseTool.prototype = new ShapeTool("EllipseTool");

function EllipseTool() {
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
    registerTool(new SquareTool());
});
