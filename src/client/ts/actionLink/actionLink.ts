
import {ActionInterface} from "../tools/actionInterface";

export abstract class ActionLink {
    constructor () {
    }

    abstract sendAction(action: ActionInterface);
}