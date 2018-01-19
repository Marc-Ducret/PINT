define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PintHistory {
        constructor(project) {
            this.project = project;
            this.history_array = [];
            this.history_position = 0;
        }
        ;
        undo() {
            if (this.history_position > 0) {
                this.history_position -= 1;
                let hist_entry = this.history_array[this.history_position];
                return {
                    sender: hist_entry.sender,
                    data: hist_entry.undo,
                };
            }
            else {
                return null;
            }
        }
        redo() {
            if (this.history_position < this.history_array.length) {
                this.history_position += 1;
                let hist_entry = this.history_array[this.history_position - 1];
                return {
                    sender: hist_entry.sender,
                    data: hist_entry.redo,
                };
            }
            else {
                return null;
            }
        }
        register_action(data, undo_action) {
            this.history_position += 1;
            this.history_array.length = this.history_position - 1;
            this.history_array.push({
                sender: data.sender,
                redo: data.data,
                undo: undo_action,
            });
        }
    }
    exports.PintHistory = PintHistory;
});
//# sourceMappingURL=history.js.map