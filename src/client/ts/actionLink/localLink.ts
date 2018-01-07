import {Project} from "../docState";
import {ActionLink} from "./actionLink";
import {ActionInterface, ActionType} from "../tools/actionInterface";
import {PintHistory} from "../history/history";

// Loopback with local history management.
export class LocalLink extends ActionLink {
    private project: Project;
    private history: PintHistory;

    constructor(project: Project) {
        super();
        this.project = project;
        this.history = new PintHistory(project);
    }

    sendAction(action: ActionInterface) {
        if (action.type == ActionType.Undo) {
            let action_packet = this.history.undo();
            if (action_packet != null) {
                this.project.applyAction(action_packet.data, this.project.currentSelection, false)
                    .then(null);
            }
        } else if (action.type == ActionType.Redo) {
            let action_packet = this.history.redo();
            if (action_packet != null) {
                this.project.applyAction(action_packet.data, this.project.currentSelection,false)
                    .then(null);
            }
        } else {
            if (action.type == ActionType.ToolApply) {
                this.project.applyAction(action, this.project.currentSelection, true)
                    .then(undo_action => {

                        this.history.register_action({
                            sender: "localhost",
                            data: action,
                        }, undo_action);
                    });
            } else if (action.type == ActionType.ToolPreview) {
                this.project.applyAction(action, this.project.currentSelection, false)
                    .then(null);
            }

        }
    }
}