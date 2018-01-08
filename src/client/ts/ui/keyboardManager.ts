import {UIController} from "./ui";
import {Tool} from "../tools/tool";

/**
 * This class handles keyboard events.
 */
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

    /**
     * Transform the KeyboardEvent to a string that represents the key combination, then forward it to handleStringEvent.
     * @param {KeyboardEvent} evt Keyboard Event
     */
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

    /**
     * Execute the action bound to a key combination string.
     * @param {string} str
     */
    private handleStringEvent(str: string) {
        if (this.data[str] !== undefined) {
            this.data[str]();
        }
    }

    /**
     * Register a keyboard shortcut
     * @param {string} binding Key combination. ([Ctrl-][Alt-][Shift-]<letter>)
     * @param {() => any} action Function to call.
     */
    public registerBinding (binding: string, action: () => any) {
        if (this.data[binding] !== undefined) {
            console.warn("Two actions registered on the key binding "+binding);
        }
        this.data[binding] = action;
    }
}