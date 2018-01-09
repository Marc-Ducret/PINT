require("amd-loader");

const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const {window} = new JSDOM(`<!DOCTYPE html>`);

global.window = window;
global.document = window.document;