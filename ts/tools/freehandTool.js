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
    class FreehandTool extends tool_1.Tool {
        constructor() {
            super("FreehandTool", "Pencil", "p");
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
            this.addSetting({ name: "lineWidth", descName: "Stroke width", inputType: settingsRequester_1.InputType.Number, defaultValue: "5" });
        }
        reset() {
        }
        startUse(img, pos) {
            this.data = {
                positions: [],
            };
            this.continueUse(pos);
        }
        endUse(pos) {
            this.continueUse(pos);
        }
        continueUse(pos) {
            let n_elem = this.data.positions.length;
            if (n_elem == 0
                || pos.distance(this.data.positions[n_elem - 1]) > 0) {
                this.data.positions.push(pos);
            }
        }
        drawPreview(layer) {
            let context = layer.getContext();
            context.globalAlpha = this.getSetting("strokeAlpha") / 100;
            context.lineWidth = this.getSetting("lineWidth");
            context.strokeStyle = this.getSetting("strokeColor");
            context.fillStyle = this.getSetting("strokeColor");
            context.lineCap = "round";
            context.lineJoin = "round";
            if (this.data.positions.length > 0) {
                context.fillRect(this.data.positions[0].x - 0.5, this.data.positions[0].y - 0.5, 1, 1);
            }
            context.beginPath();
            for (let i = 0; i < this.data.positions.length; i++) {
                let pos = this.data.positions[i];
                if (i === 0) {
                    context.moveTo(pos.x + 0.5, pos.y + 0.5);
                }
                else {
                    context.lineTo(pos.x + 0.5, pos.y + 0.5);
                }
            }
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
    exports.FreehandTool = FreehandTool;
});
//# sourceMappingURL=freehandTool.js.map