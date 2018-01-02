import {ActionInterface} from "../tools/actionInterface";

export interface HistoryEntry {
    sender: string,
    undo: ActionInterface,
    redo: ActionInterface,
}
