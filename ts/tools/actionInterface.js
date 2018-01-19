define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActionType;
    (function (ActionType) {
        ActionType[ActionType["DrawUser"] = 0] = "DrawUser";
        ActionType[ActionType["AddLayer"] = 1] = "AddLayer";
        ActionType[ActionType["DeleteLayer"] = 2] = "DeleteLayer";
        ActionType[ActionType["ToolApplyHistory"] = 3] = "ToolApplyHistory";
        ActionType[ActionType["Undo"] = 4] = "Undo";
        ActionType[ActionType["Redo"] = 5] = "Redo";
        ActionType[ActionType["Load"] = 6] = "Load";
        ActionType[ActionType["Resize"] = 7] = "Resize";
        ActionType[ActionType["ToolPreview"] = 8] = "ToolPreview";
        ActionType[ActionType["ToolApply"] = 9] = "ToolApply";
        ActionType[ActionType["UpdateLayerInfo"] = 10] = "UpdateLayerInfo";
        ActionType[ActionType["ExchangeLayers"] = 11] = "ExchangeLayers";
    })(ActionType = exports.ActionType || (exports.ActionType = {}));
});
//# sourceMappingURL=actionInterface.js.map