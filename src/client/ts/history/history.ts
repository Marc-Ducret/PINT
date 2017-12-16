import {Project} from "../docState";
import {HistoryEntry} from "./historyEntry";

export class History {

    entries: Array<HistoryEntry> = [];
    project: Project;

    constructor(project: Project) {
        this.project = project;
    };

    doAction(entry: HistoryEntry) {
        this.entries.push(entry);
        entry.doAction(this.project);
    };

    undoAction() {
        if(this.entries.length > 0) {
            let entry: HistoryEntry = this.entries.pop();
            entry.undoAction(this.project);
        }
    };
}
