export interface Option {
    name: string;
    desc: string;
}

export interface SettingRequest {
    name: string;
    descName: string;
    inputType: string;
    defaultValue: any;
    options?: Array<Option>;
}

export class SettingsRequester {
    requests: Array<SettingRequest> = [];
    data: {[name: string] : () => any} = {};

    constructor () {}

    add (req: SettingRequest) {
        this.requests.push(req);
        this.setGetter(req.name, () => req.defaultValue);
    }

    setGetter (name: string, handle: () => any) {
        this.data[name] = handle;
    }

    get (name: string) {
        return this.data[name]();
    }

}
