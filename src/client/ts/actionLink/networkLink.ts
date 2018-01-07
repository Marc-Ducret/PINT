import {Project} from "../docState";
import {ActionInterface, ActionType} from "../tools/actionInterface";
import {
    PixelSelectionHandler, PixelSelectionHandlerFromSerialized,
    SerializedPixelSelectionHandler
} from "../selection/selection";

import {ActionLink} from "./actionLink";

export interface ActionNetworkPacket {
    data: ActionInterface,
    sender: string,
}

export interface HelloNetworkPacket {
    sender: string,
    serializedSelection: SerializedPixelSelectionHandler,
}

export class NetworkLink extends ActionLink {
    private socket: SocketIOClient.Socket;
    private project: Project;
    private me: string;

    private selectionHandlers: {[id: string]: PixelSelectionHandler};

    constructor (project: Project, socket: SocketIOClient.Socket) {
        super();
        this.socket = socket;
        this.project = project;

        this.me = this.socket.id;

        this.selectionHandlers = {};
        this.selectionHandlers[this.me] = this.project.currentSelection;

        this.socket.on("action", this.onAction.bind(this));
        this.socket.on("hello", this.onHello.bind(this));
        this.socket.on("reconnect", function () {
            delete this.selectionHandlers[this.me];
            this.me = this.socket.id;
            this.selectionHandlers[this.me] = this.project.currentSelection;
        }.bind(this));
    }

    sendAction(action: ActionInterface) {
        this.socket.emit("action", {
            data: action,
            sender: this.me,
        });
    }

    onAction(action: ActionNetworkPacket) {
        if (action.sender == this.me && action.data.type == ActionType.ToolPreview) {
            return;
        }

        if (action.data.type != ActionType.ToolPreview) {
            console.log("Action from "+action.sender+" with tool "+action.data.toolName);
        }

        this.project.applyAction(action.data, this.selectionHandlers[action.sender], false);
    }

    onHello(packet: HelloNetworkPacket) {
        console.log("I got the selection data of "+packet.sender+": "+packet.serializedSelection);
        this.selectionHandlers[packet.sender] = PixelSelectionHandlerFromSerialized(packet.serializedSelection);
    }
}