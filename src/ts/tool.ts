import {SettingRequest, SettingsRequester} from "./settingsRequester";

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
    abstract startUse(img, pos);

    /**
     * Called with a position when a tool is being used and the mouse position
     * changed.
     * Params: position
     */
    abstract continueUse(pos);

    /**
     * Called with a position when a tool finished being used
     * Return: (Objet Cancellable)
     */
    abstract endUse(pos);

    /**
     * Called during the draw cycle to allow the tool to draw its pending changes
     *
     * Params: Objet Canvas
     */
    abstract drawPreview (context);


    addSetting(request: SettingRequest) {
        this.settings.add(request);
    }

}


/**
 * A Test Tool
 */
export class TestTool extends Tool {
    positions: Array<Vec2> = [];
    used: boolean = false;

    constructor () {
        super ("TestTool");

        this.addSetting({name: "strokeColor", descName: "Stroke color", inputType: "color", defaultValue: "#000000"});
        this.addSetting({name: "lineWidth", descName: "Stroke width", inputType: "number", defaultValue: "5"});
    }

    startUse (img, pos) {
        this.used = true;
        this.continueUse(pos);
    }

    endUse (pos) {
        this.used = false;
        this.positions = [];
        return null;
    }

    continueUse (pos) {
        if(this.used) {
            this.positions.push(pos);
        }
    }

    drawPreview (ctx) {
        ctx.beginPath();
        for (var i = 0; i < this.positions.length; i++) {
            var pos = this.positions[i];
            if(i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.lineWidth = this.settings.get('lineWidth');
        ctx.strokeStyle = this.settings.get('strokeColor');
        ctx.stroke();
    };
}

