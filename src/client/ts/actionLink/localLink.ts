import {Project} from "../docState";
import {ActionLink} from "./actionLink";
import {ActionInterface, ActionType} from "../tools/actionInterface";
import {PintHistory} from "../history/history";

/**
 * Local action interface, when the project is in offline mode.
 */
export class LocalLink extends ActionLink {
    private project: Project;
    private history: PintHistory;

    /**
     * Takes a project an creates the history related to this project.
     * @param {Project} project Project to manage.
     */
    constructor(project: Project) {
        super();
        this.project = project;
        this.history = new PintHistory(project);
    }

    /**
     * On local mode, action are directly forwarded back to the project, except if it's a history instruction that is
     * locally handled.
     * @param {ActionInterface} action Action to forward.
     */
    sendAction(action: ActionInterface) {
        if (action.type == ActionType.Undo) { // History undo
            let action_packet = this.history.undo();
            if (action_packet != null) {
                this.project.applyAction(action_packet.data, this.project.currentSelection, false)
                    .then(null);
            }
        } else if (action.type == ActionType.Redo) { // History redo
            let action_packet = this.history.redo();
            if (action_packet != null) {
                this.project.applyAction(action_packet.data, this.project.currentSelection, false)
                    .then(null);
            }
        } else {
            if (action.type != ActionType.ToolPreview) {// Action that generates history
                this.project.applyAction(action, this.project.currentSelection, true)
                    .then(undo_action => {
                        this.history.register_action({
                            sender: "localhost",
                            data: action,
                        }, undo_action);
                    });
            } else if (action.type == ActionType.ToolPreview) { // Action that do not generate history
                this.project.applyAction(action, this.project.currentSelection, false)
                    .then(null);
            }
        }
    }
}