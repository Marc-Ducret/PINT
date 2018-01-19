define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputType;
    (function (InputType) {
        InputType[InputType["Hidden"] = 0] = "Hidden";
        InputType[InputType["String"] = 1] = "String";
        InputType[InputType["Special"] = 2] = "Special";
        InputType[InputType["Color"] = 3] = "Color";
        InputType[InputType["Number"] = 4] = "Number";
        InputType[InputType["Range"] = 5] = "Range";
        InputType[InputType["Select"] = 6] = "Select";
    })(InputType = exports.InputType || (exports.InputType = {}));
    class SettingsRequester {
        constructor() {
            this.requests = [];
            this.data = {};
            this.cbson = true;
        }
        add(req) {
            if (req.inputType == InputType.Special) {
                if (req.name === "user_interface") {
                    this.cbson = false;
                }
            }
            else {
                this.setGetter(req.name, () => req.defaultValue);
            }
            this.requests.push(req);
        }
        setGetter(name, handle) {
            this.data[name] = handle;
        }
        get(name) {
            if (this.data[name] === undefined) {
                console.log("Parameter '" + name + "' has not been requested.");
            }
            else {
                return this.data[name](null);
            }
        }
        set(name, value) {
            if (this.data[name] === undefined) {
                console.log("Parameter '" + name + "' has not been requested.");
            }
            else {
                this.data[name](value);
            }
        }
        getRequests() {
            return this.requests;
        }
        canBeSentOverNetwork() {
            return this.cbson;
        }
        exportParameters() {
            let data = {};
            for (let req of this.requests) {
                if (req.inputType !== InputType.Special) {
                    data[req.name] = this.data[req.name](null);
                }
            }
            return data;
        }
        importParameters(settings, selectionHandler, ui) {
            for (let req of this.requests) {
                if (req.inputType !== InputType.Special) {
                    this.data[req.name] = (function () {
                        return this;
                    }).bind(settings[req.name]);
                }
                else if (req.name == "project_selection") {
                    this.data[req.name] = (function () {
                        return this;
                    }).bind(selectionHandler);
                }
                else if (req.name === "user_interface") {
                    if (ui == null) {
                        console.warn("Requested UI on server side.");
                        return;
                    }
                    this.data[req.name] = (function () {
                        return this;
                    }).bind(ui);
                }
            }
        }
    }
    exports.SettingsRequester = SettingsRequester;
});
//# sourceMappingURL=settingsRequester.js.map