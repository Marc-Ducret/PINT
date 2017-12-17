import {Project} from "./docState";
import {ActionInterface} from "./tools/actionInterface";
import {
    PixelSelectionHandler, PixelSelectionHandlerFromSerialized,
    SerializedPixelSelectionHandler
} from "./selection/selection";

export interface ActionNetworkPacket {
    data: ActionInterface,
    sender: string,
}

export interface HelloNetworkPacket {
    sender: string,
    serializedSelection: SerializedPixelSelectionHandler,
}

export class NetworkLink {
    private socket: SocketIOClient.Socket;
    private project: Project;
    private me: string;

    private selectionHandlers: {[id: string]: PixelSelectionHandler};

    constructor (project: Project, socket: SocketIOClient.Socket) {
        this.socket = socket;
        this.project = project;

        this.me = this.socket.id;

        this.selectionHandlers = {};
        this.selectionHandlers[this.me] = this.project.currentSelection;

        this.socket.on("action", this.onAction.bind(this));
        this.socket.on("hello", this.onHello.bind(this));
    }

    sendAction(action: ActionInterface) {
        this.socket.emit("action", {
            data: action,
            sender: this.me,
        });
    }

    onAction(action: ActionNetworkPacket) {
        console.log("Action from "+action.sender);
        this.project.applyAction(action.data, this.selectionHandlers[action.sender]);
    }

    onHello(packet: HelloNetworkPacket) {
        console.log("I got the selection data of "+packet.sender+": "+packet.serializedSelection);
        this.selectionHandlers[packet.sender] = PixelSelectionHandlerFromSerialized(packet.serializedSelection);
    }
}