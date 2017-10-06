
function SettingsRequester() {
    this.requests = [];

}


SettingsRequester.prototype.add = function(settingRequest) {
    if (settingRequest.name === undefined)
        return false;
    if (settingRequest.descName === undefined)
        return false;
    if (settingRequest.inputType === undefined)
        return false;
    if (settingRequest.defaultValue === undefined)
        return false;

    this.requests.push(settingRequest);
    Object.defineProperty(this, settingRequest.name, {configurable: true, get: function() {return settingRequest.defaultValue}});
    return this;
};

SettingsRequester.prototype.setGetter = function(name, handle) {
    Object.defineProperty(this, name, {configurable: true, get: handle});
};