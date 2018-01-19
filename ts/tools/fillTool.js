var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./tool", "../vec2", "../tool_settings/settingsRequester", "../image_utils/connexComponent", "./actionInterface"], function (require, exports, tool_1, vec2_1, settingsRequester_1, connexComponent_1, actionInterface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FillTool extends tool_1.Tool {
        constructor() {
            super("FillTool", "Fill", "f");
            this.addSetting({
                name: "fillColor",
                descName: "Fill color",
                inputType: settingsRequester_1.InputType.Color,
                defaultValue: "#000000"
            });
            this.addSetting({
                name: "fillAlpha",
                descName: "Fill transparency",
                inputType: settingsRequester_1.InputType.Range,
                defaultValue: 100,
                options: [
                    { name: "maxValue", desc: "100" },
                    { name: "minValue", desc: "0" }
                ]
            });
            this.addSetting({ name: "threshold", descName: "Threshold", inputType: settingsRequester_1.InputType.Number, defaultValue: 0 });
            this.addSetting({ name: "project_selection", descName: "", inputType: settingsRequester_1.InputType.Special, defaultValue: 0 });
        }
        reset() {
            this.newImage = null;
        }
        startUse(img, pos) {
            this.reset();
            this.data = {
                pixels: connexComponent_1.colorSelect(img, new vec2_1.Vec2(Math.floor(pos.x), Math.floor(pos.y)), this.getSetting("threshold")).buffer,
                width: img.width,
                height: img.height,
            };
        }
        continueUse(pos) {
        }
        endUse(pos) {
        }
        drawPreview(layer) {
            if (this.newImage == null) {
                let selection = this.getSetting("project_selection");
                let width = this.data.width;
                let height = this.data.height;
                let color_hex = this.getSetting("fillColor");
                let color_alpha = this.getSetting("fillAlpha");
                let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color_hex);
                let color = result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
                this.newImage = layer.getContext().createImageData(width, height);
                let pixels = new Uint8ClampedArray(this.data.pixels, 0);
                let nfilled = 0;
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        if (pixels[y * width + x] > 0 && selection.isSelected(new vec2_1.Vec2(x, y))) {
                            let alpha = selection.getSelectionIntensity(new vec2_1.Vec2(x, y));
                            nfilled += 1;
                            this.newImage.data[4 * (y * width + x)] = color.r;
                            this.newImage.data[4 * (y * width + x) + 1] = color.g;
                            this.newImage.data[4 * (y * width + x) + 2] = color.b;
                            this.newImage.data[4 * (y * width + x) + 3] = alpha * color_alpha / 100;
                        }
                    }
                }
                console.log("Fill tool: nfilled = " + nfilled);
            }
            layer.getContext().putImageData(this.newImage, 0, 0);
        }
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                if (generate_undo) {
                    this.drawPreview(layer);
                    return {
                        type: actionInterface_1.ActionType.ToolApplyHistory,
                        toolName: "PasteTool",
                        actionData: {},
                        toolSettings: {}
                    };
                }
                else {
                    this.drawPreview(layer);
                    return null;
                }
            });
        }
    }
    exports.FillTool = FillTool;
});
//# sourceMappingURL=fillTool.js.map