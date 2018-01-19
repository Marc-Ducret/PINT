var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./tool", "../vec2", "../image_utils/connexComponent", "../tool_settings/settingsRequester", "./actionInterface"], function (require, exports, tool_1, vec2_1, connexComponent_1, settingsRequester_1, actionInterface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AutoSelectTool extends tool_1.Tool {
        constructor() {
            super("AutoSelectTool", "Magic wand", "w");
            this.overrideSelectionMask = true;
            this.addSetting({ name: "wand_threshold", descName: "Threshold", inputType: settingsRequester_1.InputType.Number, defaultValue: 50 });
            this.addSetting({ name: "project_selection", descName: "", inputType: settingsRequester_1.InputType.Special, defaultValue: 0 });
        }
        reset() {
        }
        startUse(img, pos) {
            this.data = connexComponent_1.colorSelect(img, new vec2_1.Vec2(Math.floor(pos.x), Math.floor(pos.y)), this.getSetting("wand_threshold")).buffer;
        }
        endUse(pos) {
        }
        ;
        continueUse(pos) {
        }
        ;
        drawPreview(layer) {
            let selection = this.getSetting("project_selection");
            selection.reset();
            selection.addRegion(new Uint8ClampedArray(this.data, 0));
            selection.updateBorder();
        }
        applyTool(layer, generate_undo) {
            return __awaiter(this, void 0, void 0, function* () {
                if (generate_undo) {
                    let selection_buffer = this.getSetting("project_selection").getValues().buffer.slice(0);
                    this.drawPreview(layer);
                    return {
                        type: actionInterface_1.ActionType.ToolApply,
                        toolName: "AutoSelectTool",
                        actionData: selection_buffer,
                        toolSettings: {},
                    };
                }
                else {
                    this.drawPreview(layer);
                    return null;
                }
            });
        }
    }
    exports.AutoSelectTool = AutoSelectTool;
});
//# sourceMappingURL=autoselectTool.js.map