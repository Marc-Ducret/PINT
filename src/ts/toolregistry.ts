
import {TestTool, Tool} from "./tool";
import {ShapeTool} from "./tools/shapeTool";

export class ToolRegistry {
    registry: {[name: string]: Tool} = {};

    constructor () {
        this.registerTool(new TestTool());
        this.registerTool(new ShapeTool());
    }

    /**
     * Register a tool into the tool registry
     * @param{Tool} tool the tool to register
     */
    registerTool(tool: Tool) {
        this.registry[tool.name] = tool;
    }

    /**
     * Retrieve a tool in the registry
     * @throws{No such tool} if there is no such tool
     * @param{string} the name of the tool
     * @return the found tool
     */
    getToolByName(name: string) {
        if(this.registry[name] === undefined)
            throw "No such tool "+name;
        return this.registry[name];
    }
}
