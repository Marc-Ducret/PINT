function Viewport(canvas, layerDimensions) {
    this.canvas = canvas[0];
    this.context = this.canvas.getContext('2d');
    this.layerDimensions = layerDimensions;
    this.layerList = [];
    var self = this;

    this.viewportDimensionsChanged = function() {
        this.canvas.width = this.canvas.scrollWidth;
        this.canvas.height = this.canvas.scrollHeight;
        this.viewportDimensions = Vec2(this.canvas.width, this.canvas.height);
        window.requestAnimationFrame(this.renderLayers);
    };

    this.setLayerList = function(newLayerList) {
        this.layerList = newLayerList;
    }

    this.renderLayers = function() {
        // Reset canvas
        self.resetCanvas();

        // Set appropriate scale and translation.
        console.log(self.layerDimensions);
        console.log(self.viewportDimensions);
        var translation = self.viewportDimensions.divide(2,true).subtract(self.layerDimensions.divide(2,true),true);
        console.log("rendered canvas, translation: "+translation);
        self.context.translate(translation.x, translation.y);

        self.context.fillStyle = "#ffffff";
        self.context.fillRect(0,0,100,100);

        // Render elements.
        for (var i in self.layerList) {
            self.context.drawImage(self.layerList[i].getHTMLElement(),0,0);
        }

        self.context.translate(-translation.x, -translation.y);
    };

    this.resetCanvas = function() {
        self.context.fillStyle = "#303030";
        self.context.strokeStyle = "#303030";
        self.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    };
}