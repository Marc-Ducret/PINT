define(["require", "exports", "../tools/actionInterface", "../selection/selection", "./actionLink"], function (require, exports, actionInterface_1, selection_1, actionLink_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NetworkLink extends actionLink_1.ActionLink {
        constructor(project, socket) {
            super();
            this.socket = socket;
            this.project = project;
            this.me = this.socket.id;
            this.names = new Map();
            this.colors = new Map();
            this.selectionHandlers = {};
            this.selectionHandlers[this.me] = this.project.currentSelection;
            this.socket.on("action", this.onAction.bind(this));
            this.socket.on("hello", this.onHello.bind(this));
            this.socket.on("reconnect", function () {
                console.log("Socket reconnected with id " + this.socket.id);
                this.me = this.socket.id;
                this.selectionHandlers[this.me] = this.project.currentSelection;
            }.bind(this));
        }
        sendAction(action) {
            this.socket.emit("action", {
                data: action,
                sender: this.socket.id,
            });
        }
        onAction(action) {
            if (action.sender == this.socket.id && action.data.type == actionInterface_1.ActionType.ToolPreview) {
                return;
            }
            if (action.data.type != actionInterface_1.ActionType.ToolPreview) {
                console.log("Action from " + action.sender + " with tool " + action.data.toolName);
            }
            if (action.sender == this.socket.id) {
                this.project.setPreviewLayer("localhost");
            }
            else {
                this.project.setPreviewLayer(action.sender);
            }
            this.project.applyAction(action.data, this.selectionHandlers[action.sender], false);
            if (action.sender != this.socket.id) {
                this.project.applyAction({
                    type: actionInterface_1.ActionType.DrawUser,
                    toolName: "Draw user",
                    actionData: {
                        x: action.data.toolSettings["mouse_x"],
                        y: action.data.toolSettings["mouse_y"],
                        name: this.names.get(action.sender),
                        color: this.colors.get(action.sender),
                    },
                    toolSettings: {},
                }, this.selectionHandlers[action.sender], false);
            }
        }
        onHello(packet) {
            console.log("I've got the selection data of " + packet.sender);
            console.log(packet);
            this.selectionHandlers[packet.sender] = selection_1.PixelSelectionHandlerFromSerialized(packet.serializedSelection);
            this.names.set(packet.sender, packet.name);
            this.colors.set(packet.sender, packet.color);
        }
    }
    exports.NetworkLink = NetworkLink;
});
//# sourceMappingURL=networkLink.js.map