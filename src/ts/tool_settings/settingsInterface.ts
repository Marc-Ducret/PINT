import * as $ from "jquery";

import {Tool} from "../tools/tool";
import {Option, SettingsRequester, SettingRequest, InputType} from "./settingsRequester";
import Selector = JQuery.Selector;

/**
 * Manages HTML elements to display settings to user and transmit parameters to the requester tool.
 * Handles global settings.
 */
export class SettingsInterface {
    private container: JQuery<HTMLElement>;
    private savedSettings: {[name: string] : number} = {};

    /**
     * Constructor. Does nothing much.
     * @param {JQuery<HTMLElement>} container Root container in which UI elements will reside.
     */
    constructor (container: JQuery<HTMLElement>) {
        this.container = container;
    }

    /**
     * Creates an input HTML element requesting a given type.
     * @param {InputType} type Type of input.
     * @param {string} id Name of HTML element.
     * @param defaultValue Default value given to input.
     * @returns {JQuery<TElement extends Node>}
     */
    private static createInputElement(type: InputType, id: string, defaultValue: any) {
        let input = $("<input/>");

        let type_string: string;

        switch (type) {
            case InputType.Number:
                type_string = "number";
                break;
            case InputType.Color:
                type_string = "color";
                break;
            default:
                console.error("Wrong type requested in createInputElement.");
                return null;
                break;
        }

        input.attr("type",type_string);
        input.attr("value",defaultValue);
        input.attr("id",id);
        input.attr("name",id);
        input.attr("class", "browser-default");

        if (type === InputType.Number) {
            input.attr("min", 0);
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

        input.attr("value",defaultValue);
        input.attr("id",id);
        input.attr("name",id);

        for (let opt of options) {
            let option = $("<option>");
            console.log(opt);
            option.attr("value", opt.name);
            option.html(opt.desc);
            option.appendTo(<JQuery> input);
        }
        return input;
    }

    /**
     * Setups the interface and bindings for a given tool.
     * @param {Tool} tool
     */
    public setupToolSettings (tool : Tool) {
        this.container.empty();
        const self = this;
        for (let request of tool.settings.requests) {
            const name = request.name;
            const desc = request.descName;

            if (this.savedSettings[name] !== undefined) {
                request.defaultValue = this.savedSettings[name]; /** @warning This assumes that settings request of the same name requires the same types. **/
            }

            /*
            Create label element.
             */
            let label: JQuery<Node> = $("<label></label>");
            label.attr("for",name);
            label.html(desc);

            /*
            Create input element.
             */
            let input: JQuery<Node> = null;
            switch (request.inputType) {
                case InputType.Number:
                case InputType.Color:
                    input = SettingsInterface.createInputElement(
                        request.inputType,
                        request.name,
                        request.defaultValue);
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
            input.change((function(name) {
                self.savedSettings[name] = this.val();
            }).bind(input, request.name));

            tool.settings.setGetter(request.name, (function(name) {return this.savedSettings[name]}).bind(this, request.name));

            /*
            Connect the different HTML elements.
            */
            let container: JQuery<Node> = $("<div>");
            label.appendTo(<JQuery> container);
            input.appendTo(<JQuery> container);

            container.appendTo(<JQuery> this.container);
        }
    };
}