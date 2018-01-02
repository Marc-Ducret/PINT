import {Project} from "../docState";
import {ActionNetworkPacket} from "../networkLink";
import {ActionInterface} from "../tools/actionInterface";
import {HistoryEntry} from "./historyEntry";

export class PintHistory {
    private project: Project;

    private history_array: Array<HistoryEntry>;
    private history_position: number;

    constructor(project: Project) {
        this.project = project;
        this.history_array = [];
        this.history_position = 0;
    };

    undo(): ActionNetworkPacket {
        if (this.history_position > 0) {
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

    redo(): ActionNetworkPacket {
        if (this.history_position < this.history_array.length) {
            this.history_position += 1;
            let hist_entry = this.history_array[this.history_position-1];

            return {
                sender: hist_entry.sender,
                data: hist_entry.redo,
            };
        } else {
            return null;
        }
    }

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
