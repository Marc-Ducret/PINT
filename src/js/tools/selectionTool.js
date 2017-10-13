SelectionTool.prototype = new Tool("SelectionTool");

/**
 * Change current selection
 * @params {Selection}
 */
 function SelectionTool(selection) {
    this.positions = [];
    this.settings = new SettingsRequester();
    this.settings.add({name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#FF00FF"});
    this.settings.add({name: "lineWidth", descName: "Line width", inputType: "number", defaultValue: "1"});
    this.settings.add({name: "shape", descName: "Shape", inputType: "select", defaultValue: "square",
                        values: [{name: "square", desc: "Square"},
                                 {name: "circle", desc: "Circle"},
                                 {name: "ellipse", desc: "Ellipse"},
				 {name: "arbitrary", desc: "Arbitrary"}]});

    this.startUse = function(img, pos) {
        this.firstCorner = pos;
        this.lastCorner = pos;
    };

    this.continueUse = function(pos) {
        this.lastCorner = pos;
    };

    this.endUse = function(pos) {
        this.continueUse(pos);
	switch (this.settings.shape) {
            case "square":
		for (var i = 0 ; i < h ; i++) {
		    for (var j = 0 ; j < w ; j++){
			selection.add(Vec2(x+i, y+j), 1)
		    }
		}
                break;
            case "circle":
	        for (var i = -radius ; i < radius ; i++) {
		    w = Math.sqrt(Math.pow(radius - Math.abs(i),2));
		    for (var j = -w ; j < w ; j++){
			selection.add(Vec2(center.x + i, center.y + j), 1)
		    }
		}// @todo : verify if it doesn't matter if selection.add try
	    //to add a Vec2 out of range of the selection (+floating
	    //number instead of int
                break;
            case "ellipse":
                break;
	    case "arbitrary":
	        break;
            default:
                console.error("No shape selected.");
                break;
        }
        return null;
    };

    this.drawPreview = function(ctx) {
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
                ctx.stroke();
                break;
            case "circle":
                ctx.beginPath();
	        var center = this.firstCorner;
	        var radius = center.distance(this.lastCorner);
                ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
                ctx.stroke();
                break;
            case "ellipse":
                var xdep = this.lastCorner.x/2 + this.firstCorner.x/2,
                    ydep = this.lastCorner.y/2 + this.firstCorner.y/2,
                    xlen = Math.abs(this.lastCorner.x/2 - this.firstCorner.x/2),
                    ylen = Math.abs(this.lastCorner.y/2 - this.firstCorner.y/2);
                ctx.beginPath();
                ctx.ellipse(xdep, ydep, xlen, ylen, 0, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            default:
                console.error("No shape selected.");
                break;
        }
    };
}

$(function() {
    registerTool(new SelectionTool());
});
