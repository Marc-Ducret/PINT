export class Vec2 {
    x: number;
    y: number;

    constructor (x_: number, y_: number) {
        this.x = x_;
        this.y = y_;
    }

    distance (other: Vec2) {
        return Math.sqrt((other.x - this.x)**2 + (other.y - this.y));
    }

    divide (value: number, not_in_place: boolean) {
        if (not_in_place) {
            return new Vec2(this.x/value, this.y/value);
        } else {
            this.x = this.x/value;
            this.y = this.y/value;

            return this;
        }
    }

    subtract (other: Vec2, not_in_place: boolean) {
        if (not_in_place) {
            return new Vec2(this.x - other.x, this.y - other.y);
        } else {
            this.x = this.x - other.x;
            this.y = this.y - other.y;

            return this;
        }
    }
}