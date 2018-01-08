import {ActionInterface} from "../tools/actionInterface";

/**
 * The association of a sender, and action and it's inverse action.
 */
export interface HistoryEntry {
    /**
     * Action sender.
     */
    sender: string,
    /**
     * Action that is applied.
     */
    redo: ActionInterface,
    /**
     * Action to apply to cancel 'redo'.
     */
    undo: ActionInterface,
}
