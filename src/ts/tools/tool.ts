import {SettingRequest, SettingsRequester} from "../tool_settings/settingsRequester";
import {Vec2} from "../vec2";

export abstract class Tool {
    name: string;
    settings: SettingsRequester;

    constructor (name) {
        this.name = name;
        this.settings = new SettingsRequester();
    }

    /**
     * Called with a position when a tool starts being used.
     * Params: ImageData, position
     */
    abstract startUse(img: ImageData, pos: Vec2);

    /**
     * Called with a position when a tool is being used and the mouse position
     * changed.
     * Params: position
     */
    abstract continueUse(pos: Vec2);

    /**
     * Called with a position when a tool finished being used
     * Return: (Objet Cancellable)
     */
    abstract endUse(pos: Vec2);

    /**
     * Called during the draw cycle to allow the tool to draw its pending changes
     *
     * Params: Objet Canvas
     */
    abstract drawPreview (context: CanvasRenderingContext2D);


    addSetting(request: SettingRequest) {
        this.settings.add(request);
    }

}
