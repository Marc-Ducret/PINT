import {SettingRequest, SettingsRequester} from "../tool_settings/settingsRequester";
import {Vec2} from "../vec2";
import {HistoryEntry} from "../history/historyEntry";
import {Project} from "../docState";
import {Layer} from "../ui/layer";
import {ActionInterface, ActionType} from "./actionInterface";


export abstract class Tool {
    private name: string;
    private desc: string;
    private settings: SettingsRequester;
    protected data: any;
    readonly overrideSelectionMask: boolean = false;

    /**
     * Tool builder, giving it a name and a displayed description.
     * @param name Name
     * @param desc Description
     */
    constructor (name, desc) {
        this.name = name;
        this.desc = desc;
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
     * @param {CanvasRenderingContext2D} context Preview canvas.
     */
    abstract drawPreview (context: CanvasRenderingContext2D);

    updateData (data: any) {
        this.data = data;
    }

    /**
     *
     * @param {ActionInterface} data
     * @param {CanvasRenderingContext2D} context
     * @returns {HistoryEntry}
     */
    abstract applyTool(context: CanvasRenderingContext2D): HistoryEntry;

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

    /**
     * Get the name of the tool.
     * @returns {string}
     */
    public getName() {
        return this.name;
    }

    public getDesc() {
        return this.desc;
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
        return this.settings.requests;
    }

    getData() {
        return this.data;
    }
}
