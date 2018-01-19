var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./tool", "../tool_settings/settingsRequester"], function (require, exports, tool_1, settingsRequester_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CopyTool extends tool_1.Tool {
        constructor() {
            super("CopyTool", "Copy", "c");
            this.updated = false;
            this.addSetting({
                name: "project_clipboard",
                descName: "Clipboard",
                inputType: settingsRequester_1.InputType.Hidden,
                defaultValue: ""
            });
            this.addSetting({
                name: "project_clipboard_x",
                descName: "Clipboard X",
                inputType: settingsRequester_1.InputType.Hidden,
                defaultValue: 0
            });
            this.addSetting({
                name: "project_clipboard_y",
                descName: "Clipboard Y",
                inputType: settingsRequester_1.InputType.Hidden,
                defaultValue: 0
            });
            this.addSetting({ name: "project_selection", descName: "", inputType: settingsRequester_1.InputType.Special, defaultValue: 0 });
            this.addSetting({ name: "user_interface", descName: "", inputType: settingsRequester_1.InputType.Special, defaultValue: 0 });
        }
        reset() {
            this.updated = false;
        }
        startUse(img, pos) {
            this.data = {};
        }
        continueUse(pos) {
        }
        endUse(pos) {
            this.data = pos;
            let layer = this.getSetting("user_interface").project.currentLayer.clone();
            layer.applyMask(this.getSetting("project_selection"));
            this.setSetting("project_clipboard", layer.getHTMLElement().toDataURL());
            this.setSetting("project_clipboard_x", pos.x);
            this.setSetting("project_clipboard_y", pos.y);
        }
        drawPreview(layer) {
        }
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                return null;
            });
        }
    }
    exports.CopyTool = CopyTool;
});
//# sourceMappingURL=copyTool.js.map