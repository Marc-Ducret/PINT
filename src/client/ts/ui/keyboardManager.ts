import {UIController} from "./ui";
import {Tool} from "../tools/tool";

export class KeyboardManager {
    private ui: UIController;
    private data: {[binding: string]: () => any} = {};

    constructor (ui: UIController) {
        this.ui = ui;

        for (let i in this.ui.toolRegistry.registry) {
            let tool = this.ui.toolRegistry.registry[i];
            this.registerBinding(tool.getShortcut(), function(tool) {
                this.ui.setTool(tool);
            }.bind(this, tool));
        }
    }


    public handleEvent (evt: KeyboardEvent) {
        let combination = [];

        if (evt.ctrlKey) {
            combination.push("Ctrl");
        }

        if (evt.altKey) {
            combination.push("Alt");
        }

        if (evt.shiftKey) {
            combination.push("Shift");
        }

        combination.push(evt.key);

        this.handleStringEvent(combination.join("-"));
    }

    private handleStringEvent(str: string) {
        if (this.data[str] !== undefined) {
            this.data[str]();
        }
    }

    public registerBinding (binding: string, action: () => any) {
        if (this.data[binding] !== undefined) {
            console.warn("Two actions registered on the key binding "+binding);
        }
        this.data[binding] = action;
    }
}