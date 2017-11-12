/**
 * A couple of (Internal name, Display name), used to represent
 * multiple options in a Select.
 */
export interface Option {
    /**
     * Internal name.
     * */
    name: string;
    /**
     * Display name.
     * */
    desc: string;
}

/**
 * Describes a parameter type.
 */
export enum InputType {
    /**
     * A hexademical string describing a color.
     */
    Color,
    /**
     * A positive integer.
     */
    Number,
    /**
     * A string in a list of strings.
     */
    Select,
}

/**
 * Tool parameter description.
 */
export interface SettingRequest {
    /**
     * Internal name of parameter.
     */
    name: string;
    /**
     * Displayed name of parameter.
     */
    descName: string;
    /**
     * Parameter type
     */
    inputType: InputType;
    /**
     * Default value of parameter.
     */
    defaultValue: any;
    /**
     * For Select type, describe every option.
     */
    options?: Array<Option>;
}

/**
 * A tool can request a set of parameters using this object.
 * When the tool is instantiated, the project can build up the UI elements
 * corresponding to the requested parameters.
 */
export class SettingsRequester {
    requests: Array<SettingRequest> = [];
    data: {[name: string] : () => any} = {};

    /**
     * Does nothing as the requested parameters will be populated later on.
     */
    constructor () {}

    /**
     * Add a new parameter to the request set.
     *
     * @param {SettingRequest} req Object representing a tool parameter.
     */
    add (req: SettingRequest) {
        this.requests.push(req);
        this.setGetter(req.name, () => req.defaultValue);
    }

    /**
     * Updates a parameter to a getter that will give its value when ```get``` is called.
     * @param {string} name Parameter name.
     * @param {() => any} handle Getter, called on ```get```.
     */
    setGetter (name: string, handle: () => any) {
        this.data[name] = handle;
    }

    /***
     * A tool can call this function to get the current value of a parameter.
     * @param {string} name Parameter name.
     * @returns {any}
     */
    get (name: string) {
        return this.data[name]();
    }

}
