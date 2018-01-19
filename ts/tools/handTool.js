var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./tool", "../vec2", "../tool_settings/settingsRequester"], function (require, exports, tool_1, vec2_1, settingsRequester_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HandTool extends tool_1.Tool {
        constructor() {
            super("HandTool", "Move", "h");
            this.addSetting({ name: "user_interface", descName: "", inputType: settingsRequester_1.InputType.Special, defaultValue: 0 });
        }
        reset() {
        }
        startUse(img, pos) {
            let data = {
                firstCorner: this.getSetting("user_interface").viewport.localToGlobalPosition(pos),
                lastCorner: this.getSetting("user_interface").viewport.localToGlobalPosition(pos),
            };
            this.data = {
                fcx: data.firstCorner.x,
                fcy: data.firstCorner.y,
                lcx: data.lastCorner.x,
                lcy: data.lastCorner.y,
            };
        }
        ;
        continueUse(pos) {
            this.data.fcx = this.data.lcx;
            this.data.fcy = this.data.lcy;
            let lc = this.getSetting("user_interface").viewport.localToGlobalPosition(pos);
            this.data.lcx = lc.x;
            this.data.lcy = lc.y;
        }
        endUse(pos) {
            this.continueUse(pos);
        }
        drawPreview(layer) {
            this.getSetting("user_interface").translate(new vec2_1.Vec2(this.data.lcx - this.data.fcx, this.data.lcy - this.data.fcy));
        }
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                this.drawPreview(layer);
                return null;
            });
        }
    }
    exports.HandTool = HandTool;
});
//# sourceMappingURL=handTool.js.map