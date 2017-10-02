function Layer(dimensions) {
    this.canvasElement = $("<canvas></canvas>");
    this.context = this.canvasElement[0].getContext('2d');
    this.canvasElement[0].width = dimensions.x;
    this.canvasElement[0].height = dimensions.y;
    this.width = dimensions.x;
    this.height = dimensions.y;

    this.getHTMLElement = function() {
        return this.canvasElement[0];
    };

    this.getContext = function() {
        return this.context;
    };

    this.reset = function() {
        this.context.clearRect(0,0,this.width,this.height);
    }

    this.fill = function() {
        this.context.fillStyle = "#ffffff";
        this.context.strokeStyle = "#ffffff";
        this.context.fillRect(0,0,this.width,this.height);
    }
}
