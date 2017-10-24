import * as $ from "jquery";

import {Tool} from "../tools/tool";
import {Option, SettingsRequester, SettingRequest, InputType} from "./settingsRequester";
import Selector = JQuery.Selector;

export class SettingsInterface {
    container: JQuery<HTMLElement>;
    savedSettings: {[name: string] : number} = {};

    constructor (container: JQuery<HTMLElement>) {
        this.container = container;
    }

    setupToolSettings (tool : Tool) {
        this.container.empty();
        var self = this;
        for (let request of tool.settings.requests) {
            var name = request.name;
            var desc = request.descName;

            if (this.savedSettings[name] !== undefined) {
                request.defaultValue = this.savedSettings[name]; /** @warning This assumes that settings request of the same name requires the same types. **/
            }

            let label: JQuery<Node> = $("<label></label>");
            label.attr("for",name);
            label.html(desc);

            let input: JQuery<Node> = null;

            switch (request.inputType) {
                case InputType.Number:
                case InputType.Color:
                    let input_name = request.inputType === InputType.Color ? "color" : "number";

                    input = $("<input/>");
                    input.attr("type",input_name);
                    input.attr("value",request.defaultValue);
                    input.attr("id",request.name);
                    input.attr("name",request.name);
                    input.attr("class", "browser-default");

                    if (request.inputType === InputType.Number) {
                        input.attr("min", 0);
                    }

                    self.savedSettings[request.name] = request.defaultValue;
                    input.change((function(name) {
                        self.savedSettings[name] = this.val();
                    }).bind(input, request.name));

                    tool.settings.setGetter(request.name, (function(name) {return this.savedSettings[name]}).bind(this, request.name));
                    break;
                case InputType.Select:
                    input = $("<select>");
                    input.attr("type",request.inputType);
                    input.attr("value",request.defaultValue);
                    input.attr("id",request.name);
                    input.attr("name",request.name);

                    for (let opt of request.options) {
                        let option = $("<option>");
                        console.log(opt);
                        option.attr("value", opt.name);
                        option.html(opt.desc);
                        option.appendTo(<JQuery> input);
                    }

                    self.savedSettings[request.name] = request.defaultValue;
                    input.change((function(name) {
                        self.savedSettings[name] = this.val();
                    }).bind(input, request.name));

                    tool.settings.setGetter(request.name, (function(name) {return this.savedSettings[name]}).bind(this, request.name));
                    break;
            }

            var container: JQuery<Node> = $("<div>");
            label.appendTo(<JQuery> container);
            input.appendTo(<JQuery> container);

            container.appendTo(<JQuery> this.container);
        }
    };
}