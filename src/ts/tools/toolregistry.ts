
import {ShapeTool} from "./shapeTool";
import {AutoSelectTool} from "./autoselectTool";
import {FillTool} from "./fillTool";
import {FreehandTool} from "./freehandTool";
import {Tool} from "./tool";
import {SelectionTool} from "./selectionTool";
import {HandTool} from "./handTool";

export class ToolRegistry {
    registry: {[name: string]: Tool} = {};

    constructor () {
        this.registerTool(new ShapeTool());
        this.registerTool(new AutoSelectTool());
        this.registerTool(new FillTool());
        this.registerTool(new FreehandTool());
        this.registerTool(new SelectionTool());
        this.registerTool(new HandTool());
    }

    /**
     * Register a tool into the tool registry
     * @param{Tool} tool the tool to register
     */
    registerTool(tool: Tool) {
        this.registry[tool.getName()] = tool;
    }

    /**
     * Retrieve a tool in the registry
     * @throws{No such tool} if there is no such tool
     * @param{string} name the name of the tool
     * @return the found tool
     */
    getToolByName(name: string) {
        if(this.registry[name] === undefined)
            throw "No such tool "+name;
        return this.registry[name];
    }
}
