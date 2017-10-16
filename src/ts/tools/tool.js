var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    var toolRegistry = {};
    function registerTool(tool) {
        toolRegistry[tool.name] = tool;
    }
    function getToolByName(name) {
        if (toolRegistry[name] === undefined)
            throw "No such tool " + name;
        return toolRegistry[name];
    }
    var Tool = (function () {
        function Tool(name) {
            this.name = name;
            this.settings = new SettingsRequester(this);
        }
        Tool.prototype.addSetting = function (request) {
            this.settings.add(request);
        };
        return Tool;
    })();
    exports.Tool = Tool;
    var TestTool = (function (_super) {
        __extends(TestTool, _super);
        function TestTool() {
            _super.call(this, "TestTool");
            this.positions = [];
            this.addSetting({ name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#000000" });
            this.addSetting({ name: "lineWidth", descName: "Stroke width", inputType: "number", defaultValue: "5" });
        }
        TestTool.prototype.startUse = function (img, pos) {
            this.image = img;
            this.used = true;
            this.continueUse(pos);
        };
        TestTool.prototype.endUse = function (pos) {
            this.used = false;
            this.positions = [];
            return null;
        };
        TestTool.prototype.continueUse = function (pos) {
            if (this.used) {
                this.positions.push(pos);
            }
        };
        TestTool.prototype.drawPreview = function (ctx) {
            ctx.beginPath();
            for (var i = 0; i < this.positions.length; i++) {
                var pos = this.positions[i];
                if (i === 0) {
                    ctx.moveTo(pos.x, pos.y);
                }
                else {
                    ctx.lineTo(pos.x, pos.y);
                }
            }
            ctx.lineWidth = this.settings.lineWidth;
            ctx.strokeStyle = this.settings.strokeColor;
            ctx.stroke();
        };
        ;
        return TestTool;
    })(Tool);
    exports.TestTool = TestTool;
    registerTool(new TestTool());
});
//# sourceMappingURL=tool.js.map