define(["require", "exports", "../tool_settings/settingsRequester"], function (require, exports, settingsRequester_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tool {
        constructor(name, desc, shortcut = "") {
            this.overrideSelectionMask = false;
            this.readahead = false;
            this.name = name;
            this.desc = desc;
            this.shortcut = shortcut;
            this.settings = new settingsRequester_1.SettingsRequester();
            this.data = {};
        }
        addSetting(request) {
            this.settings.add(request);
        }
        getSetting(name) {
            return this.settings.get(name);
        }
        setSetting(key, value) {
            this.settings.set(key, value);
        }
        getName() {
            return this.name;
        }
        getDesc() {
            return this.desc;
        }
        getShortcut() {
            return this.shortcut;
        }
        settingsSetGetter(name, handle) {
            this.settings.setGetter(name, handle);
        }
        settingsGetRequests() {
            return this.settings.getRequests();
        }
        getData() {
            return this.data;
        }
        updateData(data) {
            this.data = data;
        }
        getSettings() {
            return this.settings;
        }
    }
    exports.Tool = Tool;
});
//# sourceMappingURL=tool.js.map