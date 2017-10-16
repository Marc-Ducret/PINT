define(["require", "exports", "jquery"], function (require, exports, jquery_1) {
    function SettingsInterface(container) {
        this.container = container;
        this.savedSettings = {};
        this.setupToolSettings = function (tool) {
            this.container.empty();
            var self = this;
            for (var i in tool.settings.requests) {
                var request = tool.settings.requests[i];
                var name = request.name;
                var desc = request.descName;
                if (this.savedSettings[name] !== undefined) {
                    request.defaultValue = this.savedSettings[name];
                }
                var label = jquery_1.default("<label></label>");
                label.attr("for", name);
                label.html(desc);
                var input = null;
                switch (request.inputType) {
                    case "number":
                    case "color":
                        input = jquery_1.default("<input/>");
                        input.attr("type", request.inputType);
                        input.attr("value", request.defaultValue);
                        input.attr("id", request.name);
                        input.attr("name", request.name);
                        input.attr("class", "browser-default");
                        self.savedSettings[request.name] = request.defaultValue;
                        input.change((function (name) {
                            self.savedSettings[name] = this.val();
                        }).bind(input, request.name));
                        tool.settings.setGetter(request.name, (function (name) { return this.savedSettings[name]; }).bind(this, request.name));
                        break;
                    case "select":
                        input = jquery_1.default("<select>");
                        input.attr("type", request.inputType);
                        input.attr("value", request.defaultValue);
                        input.attr("id", request.name);
                        input.attr("name", request.name);
                        jquery_1.default(request.values).each(function () {
                            var option = jquery_1.default("<option>");
                            console.log(this);
                            option.attr("value", this.name);
                            option.html(this.desc);
                            input.append(option);
                        });
                        self.savedSettings[request.name] = request.defaultValue;
                        input.change((function (name) {
                            self.savedSettings[name] = this.val();
                        }).bind(input, request.name));
                        tool.settings.setGetter(request.name, (function (name) { return this.savedSettings[name]; }).bind(this, request.name));
                        break;
                }
                var container = jquery_1.default("<div>");
                label.appendTo(container);
                input.appendTo(container);
                container.appendTo(this.container);
            }
        };
    }
});
//# sourceMappingURL=settingsInterface.js.map