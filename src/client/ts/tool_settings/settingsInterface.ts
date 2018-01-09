import * as $ from "jquery";

import {Tool} from "../tools/tool";
import {Option, InputType} from "./settingsRequester";
import {Project} from "../docState";

/**
 * Manages HTML elements to display settings to user and transmit parameters to the requester tool.
 * Handles global settings.
 */
export class SettingsInterface {
    private container: JQuery<HTMLElement>;
    private savedSettings: { [name: string]: number } = {};

    /**
     * Constructor. Does nothing much.
     * @param {JQuery<HTMLElement>} container Root container in which UI elements will reside.
     */
    constructor(container: JQuery<HTMLElement>) {
        this.container = container;
    }

    /**
     * Creates an input HTML element requesting a given type.
     * @param {InputType} type Type of input.
     * @param {string} id Name of HTML element.
     * @param defaultValue Default value given to input.
     * @param options
     * @returns {JQuery<TElement extends Node>}
     */
    private static createInputElement(type: InputType, id: string, defaultValue: any, options: Array<Option>) {
        let input = $("<input/>");

        let type_string: string;

        switch (type) {
            case InputType.String:
                type_string = "text";
                break;
            case InputType.Range:
                type_string = "range";
                break;
            case InputType.Number:
                type_string = "number";
                break;
            case InputType.Color:
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

        if (type === InputType.Number) {
            input.attr("min", 0);
        }

        if (options != undefined) {
            for (let opt of options) {
                if (opt.name === "maxValue") {
                    input.attr("max", opt.desc);
                } else if (opt.name === "minValue") {
                    input.attr("min", opt.desc);
                }
            }
        }
        return input;
    }

    /**
     * Creates a select HTML element containing given options.
     * @param {Array<Option>} options List of given options.
     * @param {string} id Name of HTML element.
     * @param defaultValue Default value given to input.
     * @returns {JQuery<TElement extends Node>}
     */
    private static createSelectElement(options: Array<Option>, id: string, defaultValue: any) {
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
            option.appendTo(<JQuery> input);
        }
        return input;
    }

    /**
     * Setups the interface and bindings for a given tool.
     * @param {Tool} tool
     * @param project
     */
    public setupToolSettings(tool: Tool, project: Project) {
        this.container.empty();
        const self = this;
        for (let request of tool.settingsGetRequests()) {
            if (request.inputType == InputType.Special) { // Special requests that use the project instance.
                let name = request.name;
                if (name === "project_selection") {
                    /// A tool can request to update the selection setting.
                    tool.settingsSetGetter("project_selection", (function () {
                        return this.currentSelection
                    }).bind(project));
                } else if (name === "user_interface") {
                    tool.settingsSetGetter("user_interface", (function () {
                        return this.getUI()
                    }).bind(project));
                }
            } else if (request.inputType == InputType.Hidden) { // The tool requests a variable that should not be shown but it remains shared between tools.
                let getter_setter_function = function (name: string, value_to_set: any) {
                    if (value_to_set !== null) {// use as a setter
                        this.savedSettings[name] = value_to_set;
                    } else { // use as a getter
                        return this.savedSettings[name];
                    }
                };

                tool.settingsSetGetter(request.name, getter_setter_function.bind(this, request.name));
            } else { // A standard request that will be instanciated in the container with an input of the correct type.
                const name = request.name;
                const desc = request.descName;

                if (this.savedSettings[name] !== undefined) {
                    /** @warning This assumes that settings request of the same name requires the same types. **/
                    request.defaultValue = this.savedSettings[name];
                }

                /*
                Create label element.
                 */
                let label: JQuery<Node> = $("<label></label>");
                label.attr("for", name);
                label.html(desc);

                if (request.inputType == InputType.Range) {
                    label.html(desc + " : " + request.defaultValue);
                }

                /*
                Create input element.
                 */
                let input: JQuery<Node> = null;
                switch (request.inputType) {
                    case InputType.Range:
                    case InputType.Number:
                    case InputType.String:
                    case InputType.Color:
                        input = SettingsInterface.createInputElement(
                            request.inputType,
                            request.name,
                            request.defaultValue,
                            request.options);
                        break;
                    case InputType.Select:
                        input = SettingsInterface.createSelectElement(
                            request.options,
                            request.name,
                            request.defaultValue);
                        break;
                }

                /*
                Bind value change to SettingsRequester.
                 */
                self.savedSettings[request.name] = request.defaultValue;
                input.on("input", (function (name) {
                    self.savedSettings[name] = this.val();
                }).bind(input, request.name));

                if (request.inputType == InputType.Range) {
                    input.on("input", (function () {
                        label.html(desc + " : " + this.val());
                    }).bind(input));
                }

                let getter_setter_function = function (name: string, input_node, value_to_set: any) {
                    if (value_to_set !== null) {// use as a setter
                        this.savedSettings[name] = value_to_set;
                        input_node.val(value_to_set);
                    } else { // use as a getter
                        return this.savedSettings[name];
                    }
                };

                tool.settingsSetGetter(request.name, getter_setter_function.bind(this, request.name, input));

                /*
                Connect the different HTML elements.
                */
                let container: JQuery<Node> = $("<div>");
                label.appendTo(<JQuery> container);
                input.appendTo(<JQuery> container);

                container.appendTo(<JQuery> this.container);
            }
        }
    };
}