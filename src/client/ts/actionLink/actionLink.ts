
import {ActionInterface} from "../tools/actionInterface";

/**
 * Interface that `Project` uses to send the actions that it wants to do.
 */
export abstract class ActionLink {
    constructor () {
    }

    /**
     * Relay the action to the main instance (that can be a server for example) that will handle what happens.
     * @param {ActionInterface} action Action to forward.
     */
    abstract sendAction(action: ActionInterface);
}