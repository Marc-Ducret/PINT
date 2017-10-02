var toolRegistry = {};

/**
 * Register a tool into the tool registry
 * @param{Tool} tool the tool to register
 */
function registerTool(tool) {
  toolRegistry[tool.name] = tool;
}

/**
 * Retrieve a tool in the registry
 * @throws{No such tool} if there is no such tool
 * @param{string} the name of the tool
 * @return the found tool
 */
function getToolByName(name) {
  if(toolRegistry[name] === undefined)
    throw "No such tool "+name;
  return toolRegistry[name];
}

function Tool(name) {
    this.name = name;

    var unimpl = function () {
        throw this.name + " doesn't implements this function";
    };

    /**
     * Called with a position when a tool starts being used.
     * Params: ImageData, position
     */
    this.startUse = unimpl;

    /**
     * Called with a position when a tool is being used and the mouse position
     * changed.
     * Params: position
     */
    this.continueUse = unimpl;

    /**
     * Called with a position when a tool finished being used
     * Return: (Objet Cancellable)
     */
    this.endUse = unimpl;

    /**
     * Called during the draw cycle to allow the tool to draw its pending changes
     *
     * Params: Objet Canvas
     */
    this.drawPreview = unimpl;
}

TestTool.prototype = new Tool("TestTool");

/**
 * A Test Tool
 */
function TestTool() {
  this.positions = [];

  this.startUse = function(img, pos) {
    this.image = img;
    this.continueUse(pos);
  };

  this.endUse = function(pos) {
    this.continueUse(pos);

    return this.drawPreview;
  };

  this.continueUse = function(pos) {
    this.positions.push(pos);
  };

  this.drawPreview = function(ctx) {
    for (var i = 0; i < this.positions.length; i++) {
      var pos = this.positions[i];
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'yellow';
      ctx.fill();
      ctx.lineWidth = .5;
      ctx.strokeStyle = '#333300';
      ctx.stroke();
    }
  };
}

registerTool(new TestTool());
