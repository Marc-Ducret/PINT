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
    class LineTool extends tool_1.Tool {
        constructor() {
            super("LineTool", "Line", "l");
            this.addSetting({
                name: "strokeColor",
                descName: "Stroke color",
                inputType: settingsRequester_1.InputType.Color,
                defaultValue: "#000000"
            });
            this.addSetting({
                name: "strokeAlpha",
                descName: "Stroke transparency",
                inputType: settingsRequester_1.InputType.Range,
                defaultValue: 100,
                options: [
                    { name: "maxValue", desc: "100" },
                    { name: "minValue", desc: "0" }
                ]
            });
            this.addSetting({ name: "lineWidth", descName: "Line width", inputType: settingsRequester_1.InputType.Number, defaultValue: "5" });
        }
        reset() {
        }
        startUse(img, pos) {
            this.data = {
                firstCorner: pos,
                lastCorner: pos,
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
            context.globalAlpha = this.getSetting("strokeAlpha") / 100;
            context.strokeStyle = this.getSetting('strokeColor');
            context.lineWidth = this.getSetting('lineWidth');
            context.beginPath();
            context.moveTo(this.data.firstCorner.x + 0.5, this.data.firstCorner.y + 0.5);
            context.lineTo(this.data.lastCorner.x + 0.5, this.data.lastCorner.y + 0.5);
            context.stroke();
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
    exports.LineTool = LineTool;
});
//# sourceMappingURL=lineTool.js.map