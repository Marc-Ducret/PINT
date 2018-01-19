define(["require", "exports", "jquery", "./ts/ui/ui"], function (require, exports, $, ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.controller = new ui_1.UIController();
    console.log("Setting up UI");
    exports.controller.bindEvents($("#toolbox-container"), $("#viewport"), $("#newproject_button"), $("#newproject_width"), $("#newproject_height"));
    document["controller"] = exports.controller;
});
//# sourceMappingURL=main.js.map