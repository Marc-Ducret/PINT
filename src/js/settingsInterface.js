function SettingsInterface(container) {
    this.container = container;
    this.savedSettings = {};

    this.setupToolSettings = function(tool) {
        this.container.empty();
        var self = this;
        for (var i in tool.settings.requests) {
            var request = tool.settings.requests[i];
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

                    $(request.values).each(function() {
                        var option = $("<option>");
                        console.log(this);
                        option.attr("value", this.name);
                        option.html(this.desc);
                        input.append(option);
                    });

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