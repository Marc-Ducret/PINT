import * as $ from "jquery";

import {Tool} from "./tool";
import {Option, SettingsRequester, SettingRequest} from "./settingsRequester";

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

            var label = $("<label></label>");
            label.attr("for",name);
            label.html(desc);

            var input = null;

            switch (request.inputType) {
                case "number":
                case "color":
                    input = $("<input/>");
                    input.attr("type",request.inputType);
                    input.attr("value",request.defaultValue);
                    input.attr("id",request.name);
                    input.attr("name",request.name);
                    input.attr("class", "browser-default");

                    self.savedSettings[request.name] = request.defaultValue;
                    input.change((function(name) {
                        self.savedSettings[name] = this.val();
                    }).bind(input, request.name));

                    tool.settings.setGetter(request.name, (function(name) {return this.savedSettings[name]}).bind(this, request.name));
                    break;
                case "select":
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
                        input.append(option);
                    }

                    self.savedSettings[request.name] = request.defaultValue;
                    input.change((function(name) {
                        self.savedSettings[name] = this.val();
                    }).bind(input, request.name));

                    tool.settings.setGetter(request.name, (function(name) {return this.savedSettings[name]}).bind(this, request.name));
                    break;
            }

            var container = $("<div>");
            label.appendTo(container);
            input.appendTo(container);

            container.appendTo(this.container);
        }
    };
}