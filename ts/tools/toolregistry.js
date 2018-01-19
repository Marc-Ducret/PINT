define(["require", "exports", "./shapeTool", "./autoselectTool", "./fillTool", "./freehandTool", "./selectionTool", "./handTool", "./lineTool", "./gradientTool", "./copyTool", "./pasteTool", "./eyedropperTool", "./eraserTool"], function (require, exports, shapeTool_1, autoselectTool_1, fillTool_1, freehandTool_1, selectionTool_1, handTool_1, lineTool_1, gradientTool_1, copyTool_1, pasteTool_1, eyedropperTool_1, eraserTool_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToolRegistry {
        constructor() {
            this.registry = {};
            this.registerTool(new shapeTool_1.ShapeTool());
            this.registerTool(new autoselectTool_1.AutoSelectTool());
            this.registerTool(new fillTool_1.FillTool());
            this.registerTool(new freehandTool_1.FreehandTool());
            this.registerTool(new selectionTool_1.SelectionTool());
            this.registerTool(new handTool_1.HandTool());
            this.registerTool(new lineTool_1.LineTool());
            this.registerTool(new gradientTool_1.GradientTool());
            this.registerTool(new copyTool_1.CopyTool());
            this.registerTool(new pasteTool_1.PasteTool());
            this.registerTool(new eyedropperTool_1.EyedropperTool());
            this.registerTool(new eraserTool_1.EraserTool());
        }
        registerTool(tool) {
            this.registry[tool.getName()] = tool;
        }
        getToolByName(name) {
            if (this.registry[name] === undefined)
                throw "No such tool " + name;
            return this.registry[name];
        }
        getTools() {
            let tools = [];
            for (let name in this.registry) {
                tools.push(this.registry[name]);
            }
            return tools;
        }
    }
    exports.ToolRegistry = ToolRegistry;
});
//# sourceMappingURL=toolregistry.js.map