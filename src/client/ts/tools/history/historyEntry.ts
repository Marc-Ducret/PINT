import {Project} from "../../docState";

export class HistoryEntry {

    doFunction;
    undoFunction;
    data;

    constructor(doFunction, undoFunction, data) {
        this.doFunction = doFunction;
        this.undoFunction = undoFunction;
        this.data = data;
    };

    doAction(project: Project) {
        this.doFunction(this.data, project);
    };

    undoAction(project: Project) {
        this.undoFunction(this.data, project);
    };
}
