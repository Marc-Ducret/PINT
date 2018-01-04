import {SettingRequest, SettingsRequester} from "../tool_settings/settingsRequester";
import {Vec2} from "../vec2";
import {HistoryEntry} from "../history/historyEntry";
import {Layer} from "../ui/layer";
import {ActionInterface, ActionType} from "./actionInterface";
import {Settings} from "http2";


export abstract class Tool {
    private name: string;
    private desc: string;
    private shortcut: string;

    private settings: SettingsRequester;
    protected data: any;
    readonly overrideSelectionMask: boolean = false;

    /**
     * Tool builder, giving it a name and a displayed description.
     * @param name Name.
     * @param desc Dsiplayed name.
     * @param shortcut Keyboard key associated to the tool.
     */
    constructor(name: string, desc: string, shortcut: string = "") {
        this.name = name;
        this.desc = desc;
        this.shortcut = shortcut;
        this.settings = new SettingsRequester();
        this.data = {};
    }

    /**
     * Reset internal state of the tool.
     */
    abstract reset();

    /**
     * Function called on first click using the tool.
     * @param {ImageData} img Canvas content on tool click.
     * @param {Vec2} pos Mouse position on click..
     */
    abstract startUse(img: ImageData, pos: Vec2);

    /**
     * Called on mouse move.
     * @param {Vec2} pos Mouse position.
     */
    abstract continueUse(pos: Vec2);

    /**
     * Called on mouse release.
     * @param {Vec2} pos Mouse position on release.
     */
    abstract endUse(pos: Vec2);

    /**
     * Here the tool should draw its pending changes on the preview canvas layer.
     * @param {CanvasRenderingContext2D} layer Preview canvas.
     */
    abstract drawPreview(layer: Layer);

    updateData (data: any) {
        this.data = data;
    }

    /**
     *
     * @param {Layer} layer on which the tool is applied
     * @returns {HistoryEntry}
     */
    abstract async applyTool(layer: Layer, generate_undo: boolean): Promise<ActionInterface>;

    /**
     * Called by the inherited classes when they need a custom parameter that the UI should provide.
     * @param {SettingRequest} request Requested parameter.
     */
    protected addSetting(request: SettingRequest) {
        this.settings.add(request);
    }

    /**
     * Returns the value of a requested parameter.
     * @warning No checks are made, maybe the parameter hasn't been requested.
     * @param {string} name Requested parameter value.
     * @returns {any}
     */
    protected getSetting(name: string) {
        return this.settings.get(name);
    }


    protected setSetting(key: string, value: any) {
        this.settings.set(key, value);
    }


    /**
     * Get the name of the tool.
     * @returns {string}
     */
    public getName() {
        return this.name;
    }

    /**
     * Get tool displayed name.
     * @returns {string}
     */
    public getDesc() {
        return this.desc;
    }

    /**
     * Get tool keyboard shortcut.
     * @returns {string}
     */
    public getShortcut() {
        return this.shortcut;
    }

    /**
     * Updates a setting handler (if settings UI is reset for example).
     * @param {string} name Parameter name.
     * @param {() => any} handle Function that on call, will give the parameter value.
     */
    public settingsSetGetter(name: string, handle: () => any) {
        this.settings.setGetter(name, handle);
    }

    /**
     * Returns the list of parameters requested by the tool.
     * @returns {Array<SettingRequest>}
     */
    public settingsGetRequests() {
        return this.settings.getRequests();
    }

    getData() {
        return this.data;
    }

    getSettings(): SettingsRequester {
        return this.settings;
    }
}
