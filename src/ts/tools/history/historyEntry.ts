export class HistoryEntry {

    doAction;
    undoAction;

    constructor(doAction, undoAction) {
        this.doAction = doAction;
        this.undoAction = undoAction;
    }
}
