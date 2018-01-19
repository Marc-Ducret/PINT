define(["require", "exports", "jquery", "./settingsRequester"], function (require, exports, $, settingsRequester_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SettingsInterface {
        constructor(container) {
            this.savedSettings = {};
            this.container = container;
        }
        static createInputElement(type, id, defaultValue, options) {
            let input = $("<input/>");
            let type_string;
            switch (type) {
                case settingsRequester_1.InputType.String:
                    type_string = "text";
                    break;
                case settingsRequester_1.InputType.Range:
                    type_string = "range";
                    break;
                case settingsRequester_1.InputType.Number:
                    type_string = "number";
                    break;
                case settingsRequester_1.InputType.Color:
                    type_string = "color";
                    break;
                default:
                    console.error("Wrong type requested in createInputElement.");
                    return null;
            }
            input.attr("type", type_string);
            input.attr("value", defaultValue);
            input.attr("id", id);
            input.attr("name", id);
            input.css("color", "#FFFFFF");
            input.css("font-size", "25px");
            if (type === settingsRequester_1.InputType.Number) {
                input.attr("min", 0);
            }
            if (options != undefined) {
                for (let opt of options) {
                    if (opt.name === "maxValue") {
                        input.attr("max", opt.desc);
                    }
                    else if (opt.name === "minValue") {
                        input.attr("min", opt.desc);
                    }
                }
            }
            return input;
        }
        static createSelectElement(options, id, defaultValue) {
            let input = $("<select>");
            input.attr("value", defaultValue);
            input.attr("id", id);
            input.attr("name", id);
            for (let opt of options) {
                let option = $("<option>");
                if (opt.name === defaultValue) {
                    option.attr("selected", "selected");
                }
                option.attr("value", opt.name);
                option.html(opt.desc);
                option.appendTo(input);
            }
            return input;
        }
        setupToolSettings(tool, project) {
            this.container.empty();
            const self = this;
            for (let request of tool.settingsGetRequests()) {
                if (request.inputType == settingsRequester_1.InputType.Special) {
                    let name = request.name;
                    if (name === "project_selection") {
                        tool.settingsSetGetter("project_selection", (function () {
                            return this.currentSelection;
                        }).bind(project));
                    }
                    else if (name === "user_interface") {
                        tool.settingsSetGetter("user_interface", (function () {
                            return this.getUI();
                        }).bind(project));
                    }
                }
                else if (request.inputType == settingsRequester_1.InputType.Hidden) {
                    let getter_setter_function = function (name, value_to_set) {
                        if (value_to_set !== null) {
                            this.savedSettings[name] = value_to_set;
                        }
                        else {
                            return this.savedSettings[name];
                        }
                    };
                    tool.settingsSetGetter(request.name, getter_setter_function.bind(this, request.name));
                }
                else {
                    const name = request.name;
                    const desc = request.descName;
                    if (this.savedSettings[name] !== undefined) {
                        request.defaultValue = this.savedSettings[name];
                    }
                    let label = $("<label></label>");
                    label.attr("for", name);
                    label.html(desc);
                    if (request.inputType == settingsRequester_1.InputType.Range) {
                        label.html(desc + " : " + request.defaultValue);
                    }
                    let input = null;
                    switch (request.inputType) {
                        case settingsRequester_1.InputType.Range:
                        case settingsRequester_1.InputType.Number:
                        case settingsRequester_1.InputType.String:
                        case settingsRequester_1.InputType.Color:
                            input = SettingsInterface.createInputElement(request.inputType, request.name, request.defaultValue, request.options);
                            break;
                        case settingsRequester_1.InputType.Select:
                            input = SettingsInterface.createSelectElement(request.options, request.name, request.defaultValue);
                            break;
                    }
                    self.savedSettings[request.name] = request.defaultValue;
                    input.on("input", (function (name) {
                        self.savedSettings[name] = this.val();
                    }).bind(input, request.name));
                    if (request.inputType == settingsRequester_1.InputType.Range) {
                        input.on("input", (function () {
                            label.html(desc + " : " + this.val());
                        }).bind(input));
                    }
                    let getter_setter_function = function (name, input_node, value_to_set) {
                        if (value_to_set !== null) {
                            this.savedSettings[name] = value_to_set;
                            input_node.val(value_to_set);
                        }
                        else {
                            return this.savedSettings[name];
                        }
                    };
                    tool.settingsSetGetter(request.name, getter_setter_function.bind(this, request.name, input));
                    let container = $("<div>");
                    label.appendTo(container);
                    input.appendTo(container);
                    container.appendTo(this.container);
                }
            }
        }
        ;
    }
    exports.SettingsInterface = SettingsInterface;
});
//# sourceMappingURL=settingsInterface.js.map