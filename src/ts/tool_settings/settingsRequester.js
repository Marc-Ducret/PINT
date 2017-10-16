define(["require", "exports"], function (require, exports) {
    var SettingsRequester = (function () {
        function SettingsRequester() {
            this.requests = [];
        }
        SettingsRequester.prototype.add = function (req) {
            this.requests.push(req);
            this.setGetter(settingRequest.name, function () { return settingRequest.defaultValue; });
        };
        SettingsRequester.prototype.setGetter = function (name, handle) {
            Object.defineProperty(this, settingRequest.name, { configurable: true, get: function () { return settingRequest.defaultValue; } });
        };
        return SettingsRequester;
    })();
    exports.SettingsRequester = SettingsRequester;
});
//# sourceMappingURL=settingsRequester.js.map