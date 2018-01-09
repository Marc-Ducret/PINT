import {Project} from "../docState";
import {ActionNetworkPacket} from "../actionLink/networkLink";
import {ActionInterface} from "../tools/actionInterface";
import {HistoryEntry} from "./historyEntry";

/**
 * History handler. It is multiple user aware, and handles actions, do and undo.
 */
export class PintHistory {
    private project: Project;

    private history_array: Array<HistoryEntry>;
    private history_position: number;

    constructor(project: Project) {
        this.project = project;
        this.history_array = [];
        this.history_position = 0;
    };

    /**
     * Generate the action that will go backward in history, and update history state.
     * @returns {ActionNetworkPacket} The action that needs to be applied to undo current state,
     * or null if it's not possible.
     */
    undo(): ActionNetworkPacket {
        if (this.history_position > 0) { // Check if there's something to undo.
            this.history_position -= 1;

            let hist_entry = this.history_array[this.history_position];

            return {
                sender: hist_entry.sender,
                data: hist_entry.undo,
            };
        } else {
            return null;
        }
    }

    /**
     * Generate the action that will go forward in history, and update history state.
     * @returns {ActionNetworkPacket} The action that needs to be applied to redo from current state,
     * or null if it's not possible.
     */
    redo(): ActionNetworkPacket {
        if (this.history_position < this.history_array.length) { // Check if there's something to redo.
            this.history_position += 1;
            let hist_entry = this.history_array[this.history_position - 1];

            return {
                sender: hist_entry.sender,
                data: hist_entry.redo,
            };
        } else {
            return null;
        }
    }

    /**
     * Go forward in history by adding a new action.
     * @param {ActionNetworkPacket} data Action to add.
     * @param {ActionInterface} undo_action Action that need to be applied to undo the added action.
     */
    register_action(data: ActionNetworkPacket, undo_action: ActionInterface) {
        this.history_position += 1;
        this.history_array.length = this.history_position - 1;
        this.history_array.push({
            sender: data.sender,
            redo: data.data,
            undo: undo_action,
        });
    }
}
