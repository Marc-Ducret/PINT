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
    class EyedropperTool extends tool_1.Tool {
        constructor() {
            super("EyedropperTool", "Select color from the canvas", "");
            this.addSetting({
                name: "strokeColor",
                descName: "Stroke color",
                inputType: settingsRequester_1.InputType.Color,
                defaultValue: "#000000"
            });
            this.addSetting({
                name: "fillColor",
                descName: "Fill color",
                inputType: settingsRequester_1.InputType.Color,
                defaultValue: "#000000"
            });
            this.addSetting({
                name: "colorSetting", descName: "Color to select", inputType: settingsRequester_1.InputType.Select, defaultValue: "strokeColor",
                options: [{ name: "strokeColor", desc: "Stroke color" },
                    { name: "fillColor", desc: "Fill color" }]
            });
        }
        reset() {
        }
        startUse(img, pos) {
            this.img = img;
            this.continueUse(pos);
        }
        continueUse(pos) {
            let img = this.img;
            let intToRGB = function (i) {
                let c = (i & 0x00FFFFFF)
                    .toString(16)
                    .toUpperCase();
                return "00000".substring(0, 6 - c.length) + c;
            };
            let colorOf = function (x, y) {
                x = Math.floor(x);
                y = Math.floor(y);
                let i = img.width * y + x;
                let col = img.data[i * 4] << 16;
                col += img.data[i * 4 + 1] << 8;
                col += img.data[i * 4 + 2] << 0;
                return '#' + intToRGB(col);
            };
            let color = colorOf(pos.x, pos.y);
            this.setSetting(this.getSetting("colorSetting"), color);
            if (this.icon != null) {
                this.icon.setAttribute("style", "color: " + color);
            }
        }
        endUse(pos) {
            this.continueUse(pos);
            if (this.icon != null) {
                this.icon.removeAttribute("style");
            }
        }
        drawPreview(layer) {
        }
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                return null;
            });
        }
    }
    exports.EyedropperTool = EyedropperTool;
});
//# sourceMappingURL=eyedropperTool.js.map