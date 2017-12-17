import {Project} from "./docState";
import {ActionInterface} from "./tools/actionInterface";

export class NetworkLink {
    private socket: SocketIOClient.Socket;
    private project: Project;

    constructor (project: Project, socket: SocketIOClient.Socket) {
        this.socket = socket;
        this.project = project;

        this.socket.on("action", this.onAction.bind(this));
    }

    sendAction(action: ActionInterface) {
        this.socket.emit("action", action);
    }

    onAction(action: ActionInterface) {
        console.log("received action");
        this.project.applyAction(action);
    }
}