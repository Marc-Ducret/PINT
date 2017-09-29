function Layer(zIndex) {
    this.canvasElement = $("<canvas></canvas>");
    this.canvasElement.css('z-index', zIndex);
    this.context = this.canvasElement[0].getContext('2d');

    this.insertAfter = function(position) {
        position.after(this.canvasElement);
        this.width = this.canvasElement[0].scrollWidth;
        this.height = this.canvasElement[0].scrollHeight;
        this.canvasElement[0].height = this.height;
        this.canvasElement[0].width = this.width;
        console.log("Inserted canvas element. ("+this.width+";"+this.height+")");
        this.reset();

    };

    this.getHTMLElement = function() {
        return this.canvasElement[0];
    };

    this.getContext = function() {
        return this.context;
    };

    this.setZIndex = function(zIndex) {
        this.canvasElement.css('z-index', zIndex);
    };

    this.reset = function() {
        this.context.fillStyle = "#ffffff";
        this.context.strokeStyle = "#ffffff";
        this.context.fillRect(0,0,this.width,this.height);
    }
}