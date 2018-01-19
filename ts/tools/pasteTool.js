var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./tool", "../tool_settings/settingsRequester", "./actionInterface"], function (require, exports, tool_1, settingsRequester_1, actionInterface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PasteTool extends tool_1.Tool {
        constructor() {
            super("PasteTool", "Paste", "v");
            this.ready = false;
            this.readahead = true;
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
            this.addSetting({
                name: "mode", descName: "Composition mode", inputType: settingsRequester_1.InputType.Select, defaultValue: "source-over",
                options: [
                    { name: "source-over", desc: "Source over" },
                    { name: "source-in", desc: "Source in" },
                    { name: "source-out", desc: "Source out" },
                    { name: "source-atop", desc: "Source atop" },
                    { name: "destination-over", desc: "Destination over" },
                    { name: "destination-in", desc: "Destination in" },
                    { name: "destination-out", desc: "Destination out" },
                    { name: "destination-atop", desc: "Destination atop" },
                    { name: "lighter", desc: "Lighter" },
                    { name: "xor", desc: "Xor" },
                    { name: "multiply", desc: "Multiply" },
                    { name: "screen", desc: "Screen" },
                    { name: "overlay", desc: "Overlay" },
                    { name: "darken", desc: "Darken" },
                    { name: "lighten", desc: "Lighten" },
                    { name: "color-dodge", desc: "Color dodge" },
                    { name: "color-burn", desc: "Color burn" },
                    { name: "hard-light", desc: "Hard light" },
                    { name: "soft-light", desc: "Soft light" },
                    { name: "difference", desc: "Difference" },
                    { name: "exclusion", desc: "Exclusion" },
                    { name: "hue", desc: "Hue" },
                    { name: "saturation", desc: "Saturation" },
                    { name: "color", desc: "Color" },
                    { name: "luminosity", desc: "Luminosity" }
                ]
            });
        }
        reset() {
            this.ready = false;
        }
        startUse(img, pos) {
            this.data = {};
        }
        continueUse(pos) {
        }
        endUse(pos) {
            this.data = pos;
        }
        drawPreview(layer) {
        }
        ;
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.getSetting("project_clipboard") == "") {
                    return null;
                }
                layer.getContext().save();
                layer.getContext().globalCompositeOperation = this.getSetting("mode");
                if (this.getSetting("mode") == "copy") {
                    layer.reset();
                }
                if (this.data.filter != undefined) {
                    layer.getContext().filter = this.data.filter;
                }
                yield layer.drawDataUrl(this.getSetting("project_clipboard"), this.data.x - this.getSetting("project_clipboard_x"), this.data.y - this.getSetting("project_clipboard_y"));
                layer.getContext().restore();
                return {
                    type: actionInterface_1.ActionType.ToolApplyHistory,
                    toolName: "PasteTool",
                    actionData: {},
                    toolSettings: {}
                };
            });
        }
    }
    exports.PasteTool = PasteTool;
});
//# sourceMappingURL=pasteTool.js.map