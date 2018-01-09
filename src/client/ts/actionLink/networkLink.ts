import {Project} from "../docState";
import {ActionInterface, ActionType} from "../tools/actionInterface";
import {
    PixelSelectionHandler, PixelSelectionHandlerFromSerialized,
    SerializedPixelSelectionHandler
} from "../selection/selection";

import {ActionLink} from "./actionLink";

/**
 * Encapsulation of the ActionInterface that adds sender id.
 */
export interface ActionNetworkPacket {
    /**
     * Action
     */
    data: ActionInterface,
    /**
     * Action source
     */
    sender: string,
}

/**
 * Welcome packet received when the user joins a project. For each user in the project, a PixelSelectionHandler is sent
 * so that each user have of copy of every user's selection.
 */
export interface HelloNetworkPacket {
    /**
     * Socket id representing the user.
     */
    sender: string,
    /**
     * Serialized instance of sender's PixelSelectionHandler.
     */
    serializedSelection: SerializedPixelSelectionHandler,
}

/**
 * Network relay when project is in online mode.
 */
export class NetworkLink extends ActionLink {
    private socket: SocketIOClient.Socket;
    private project: Project;
    private me: string;

    private selectionHandlers: { [id: string]: PixelSelectionHandler };

    /**
     * Bind networks event to link client and server.
     * @param {Project} project Working project
     * @param {SocketIOClient.Socket} socket Socket.IO client instance
     */
    constructor(project: Project, socket: SocketIOClient.Socket) {
        super();
        // Save parameters
        this.socket = socket;
        this.project = project;

        // Save socket id.
        this.me = this.socket.id;

        // Prepare selection handlers
        this.selectionHandlers = {};
        this.selectionHandlers[this.me] = this.project.currentSelection;

        // Bind events
        this.socket.on("action", this.onAction.bind(this));
        this.socket.on("hello", this.onHello.bind(this));
        this.socket.on("reconnect", function () {
            console.log("Socket reconnected with id " + this.socket.id);
            this.me = this.socket.id;
            this.selectionHandlers[this.me] = this.project.currentSelection;
        }.bind(this));
    }

    /**
     * Send action to the server.
     * @param {ActionInterface} action Action to send.
     */
    sendAction(action: ActionInterface) {
        // Pack data and emit the packet.
        this.socket.emit("action", {
            data: action,
            sender: this.socket.id,
        });
    }

    /**
     * A packet has been received by the server, relay it to the project.
     * @param {ActionNetworkPacket} action Action packet
     */
    onAction(action: ActionNetworkPacket) {
        // Preview is pre-rendered before being sent, thus it doesn't need to be applied again.
        if (action.sender == this.socket.id && action.data.type == ActionType.ToolPreview) {
            return;
        }

        // Action debug
        if (action.data.type != ActionType.ToolPreview) {
            console.log("Action from " + action.sender + " with tool " + action.data.toolName);
        }

        // Action forward.
        this.project.applyAction(action.data, this.selectionHandlers[action.sender], false);
    }

    /**
     * HelloNetworkPacket handler: creates the PixelSelectionHandler of packet.sender by unserializing the data.
     * @param {HelloNetworkPacket} packet
     */
    onHello(packet: HelloNetworkPacket) {
        console.log("I've got the selection data of " + packet.sender);
        console.log(packet);
        this.selectionHandlers[packet.sender] = PixelSelectionHandlerFromSerialized(packet.serializedSelection);
    }
}