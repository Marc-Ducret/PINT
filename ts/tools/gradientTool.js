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
    class GradientTool extends tool_1.Tool {
        constructor() {
            super("GradientTool", "Gradient", "g");
            this.addSetting({ name: "color1", descName: "from", inputType: settingsRequester_1.InputType.Color, defaultValue: "#000000" });
            this.addSetting({ name: "color2", descName: "to", inputType: settingsRequester_1.InputType.Color, defaultValue: "#FFFFFF" });
            this.addSetting({
                name: "transparencyAlpha",
                descName: "transparency",
                inputType: settingsRequester_1.InputType.Range,
                defaultValue: 100,
                options: [
                    { name: "maxValue", desc: "100" },
                    { name: "minValue", desc: "0" }
                ]
            });
        }
        reset() {
        }
        startUse(img, pos) {
            this.data = {
                firstCorner: pos,
                lastCorner: pos,
                width: img.width,
                height: img.height,
            };
        }
        continueUse(pos) {
            this.data.lastCorner = pos;
        }
        endUse(pos) {
            this.continueUse(pos);
        }
        drawPreview(layer) {
            let context = layer.getContext();
            context.globalAlpha = this.getSetting('transparencyAlpha') / 100;
            let gradient = context.createLinearGradient(this.data.firstCorner.x, this.data.firstCorner.y, this.data.lastCorner.x, this.data.lastCorner.y);
            gradient.addColorStop(0, this.getSetting('color1'));
            gradient.addColorStop(1, this.getSetting('color2'));
            context.fillStyle = gradient;
            context.fillRect(0, 0, this.data.width, this.data.height);
            context.globalAlpha = 1;
        }
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                this.drawPreview(layer);
                if (generate_undo) {
                    return {
                        type: actionInterface_1.ActionType.ToolApplyHistory,
                        toolName: "PasteTool",
                        actionData: {},
                        toolSettings: {}
                    };
                }
                else {
                    return null;
                }
            });
        }
    }
    exports.GradientTool = GradientTool;
});
//# sourceMappingURL=gradientTool.js.map