function Tool(name) {
  this.name = name;

  var unimpl = function() {
    throw this.name + " doesn't implements this function";
  }

/**
* Called with a position when a tool starts being used
*/
  this.startUse = unimpl;

/**
* Called with a position when a tool is being used and the mouse position
* changed
*/
  this.continueUse = unimpl;

/**
* Called with a position when a tool finished being used
*/
  this.endUse = unimpl;

/**
* Called during the draw cycle to allow the tool to draw its pending changes
*/
  this.drawPreview = unimpl;
}
