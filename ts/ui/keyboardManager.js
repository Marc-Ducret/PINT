define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeyboardManager {
        constructor(ui) {
            this.data = {};
            this.ui = ui;
            for (let i in this.ui.toolRegistry.registry) {
                let tool = this.ui.toolRegistry.registry[i];
                this.registerBinding(tool.getShortcut(), function (tool) {
                    this.ui.setTool(tool);
                }.bind(this, tool));
            }
        }
        handleEvent(evt) {
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
        handleStringEvent(str) {
            if (this.data[str] !== undefined) {
                this.data[str]();
            }
        }
        registerBinding(binding, action) {
            if (this.data[binding] !== undefined) {
                console.warn("Two actions registered on the key binding " + binding);
            }
            this.data[binding] = action;
        }
    }
    exports.KeyboardManager = KeyboardManager;
});
//# sourceMappingURL=keyboardManager.js.map