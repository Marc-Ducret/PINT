var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./tool", "../vec2", "../tool_settings/settingsRequester", "./actionInterface"], function (require, exports, tool_1, vec2_1, settingsRequester_1, actionInterface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function drawEllipse(ctx, x, y, w, h) {
        let kappa = .5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.stroke();
    }
    class ShapeTool extends tool_1.Tool {
        constructor() {
            super("ShapeTool", "Shape", "q");
            this.addSetting({
                name: "strokeColor",
                descName: "Stroke color",
                inputType: settingsRequester_1.InputType.Color,
                defaultValue: "#ffffff"
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
            this.addSetting({ name: "lineWidth", descName: "Line width", inputType: settingsRequester_1.InputType.Number, defaultValue: "5" });
            this.addSetting({
                name: "shape", descName: "Shape", inputType: settingsRequester_1.InputType.Select, defaultValue: "square",
                options: [{ name: "square", desc: "Square" },
                    { name: "circle", desc: "Circle" },
                    { name: "ellipse", desc: "Ellipse" }]
            });
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
        reset() {
        }
        endUse(pos) {
            this.continueUse(pos);
        }
        drawPreview(layer) {
            let context = layer.getContext();
            context.fillStyle = this.getSetting('fillColor');
            context.strokeStyle = this.getSetting('strokeColor');
            context.lineWidth = this.getSetting('lineWidth');
            let firstCorner = new vec2_1.Vec2(this.data.firstCorner.x, this.data.firstCorner.y);
            let lastCorner = new vec2_1.Vec2(this.data.lastCorner.x, this.data.lastCorner.y);
            switch (this.getSetting('shape')) {
                case "square":
                    context.beginPath();
                    const x = Math.min(firstCorner.x, lastCorner.x), y = Math.min(firstCorner.y, lastCorner.y), w = Math.abs(firstCorner.x - lastCorner.x), h = Math.abs(firstCorner.y - lastCorner.y);
                    context.rect(x + 0.5, y + 0.5, w, h);
                    break;
                case "circle":
                    context.beginPath();
                    context.arc(firstCorner.x, firstCorner.y, firstCorner.distance(lastCorner), 0, 2 * Math.PI, false);
                    break;
                case "ellipse":
                    const xdep = firstCorner.x, ydep = firstCorner.y, xlen = lastCorner.x - firstCorner.x, ylen = lastCorner.y - firstCorner.y;
                    drawEllipse(context, xdep, ydep, xlen, ylen);
                    break;
                default:
                    console.error("No shape selected.");
                    break;
            }
            context.globalAlpha = this.getSetting("fillAlpha") / 100;
            context.fill();
            context.globalAlpha = this.getSetting("strokeAlpha") / 100;
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
    exports.ShapeTool = ShapeTool;
});
//# sourceMappingURL=shapeTool.js.map