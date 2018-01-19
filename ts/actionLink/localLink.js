define(["require", "exports", "./actionLink", "../tools/actionInterface", "../history/history"], function (require, exports, actionLink_1, actionInterface_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LocalLink extends actionLink_1.ActionLink {
        constructor(project) {
            super();
            this.project = project;
            this.history = new history_1.PintHistory(project);
            this.project.setPreviewLayer("localhost");
        }
        sendAction(action) {
            if (action.type == actionInterface_1.ActionType.Undo) {
                let action_packet = this.history.undo();
                if (action_packet != null) {
                    this.project.applyAction(action_packet.data, this.project.currentSelection, false)
                        .then(null);
                }
            }
            else if (action.type == actionInterface_1.ActionType.Redo) {
                let action_packet = this.history.redo();
                if (action_packet != null) {
                    this.project.applyAction(action_packet.data, this.project.currentSelection, false)
                        .then(null);
                }
            }
            else {
                if (action.type != actionInterface_1.ActionType.ToolPreview) {
                    this.project.applyAction(action, this.project.currentSelection, true)
                        .then(undo_action => {
                        this.history.register_action({
                            sender: "localhost",
                            data: action,
                        }, undo_action);
                    });
                }
                else if (action.type == actionInterface_1.ActionType.ToolPreview) {
                    this.project.applyAction(action, this.project.currentSelection, false)
                        .then(null);
                }
            }
        }
    }
    exports.LocalLink = LocalLink;
});
//# sourceMappingURL=localLink.js.map