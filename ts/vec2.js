define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Vec2 {
        constructor(x_, y_) {
            this.x = x_;
            this.y = y_;
        }
        floor() {
            return new Vec2(Math.floor(this.x), Math.floor(this.y));
        }
        distance(other) {
            return Math.sqrt(Math.pow((other.x - this.x), 2) + Math.pow((other.y - this.y), 2));
        }
        divide(value, not_in_place) {
            if (not_in_place) {
                return new Vec2(this.x / value, this.y / value);
            }
            else {
                this.x = this.x / value;
                this.y = this.y / value;
                return this;
            }
        }
        subtract(other, not_in_place) {
            if (not_in_place) {
                return new Vec2(this.x - other.x, this.y - other.y);
            }
            else {
                this.x = this.x - other.x;
                this.y = this.y - other.y;
                return this;
            }
        }
        add(other, not_in_place) {
            if (not_in_place) {
                return new Vec2(this.x + other.x, this.y + other.y);
            }
            else {
                this.x = this.x + other.x;
                this.y = this.y + other.y;
                return this;
            }
        }
    }
    exports.Vec2 = Vec2;
});
//# sourceMappingURL=vec2.js.map