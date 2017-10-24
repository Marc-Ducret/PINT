/**
 * Small class to handle a pair of numbers, typically coordinates.
 */
export class Vec2 {
    x: number;
    y: number;

    constructor (x_: number, y_: number) {
        this.x = x_;
        this.y = y_;
    }

    /**
     * Euclidean distance between this point and another one.
     * @param {Vec2} other Another point.
     * @returns {number}
     */
    distance (other: Vec2) {
        return Math.sqrt((other.x - this.x)**2 + (other.y - this.y));
    }

    /**
     * Divide this vector by a number.
     * @warning This number shouldn't be zero.
     * @param {number} value
     * @param {boolean} not_in_place If true, creates a new vector. If false, made in place.
     * @returns {Vec2}
     */
    divide (value: number, not_in_place: boolean) {
        if (not_in_place) {
            return new Vec2(this.x/value, this.y/value);
        } else {
            this.x = this.x/value;
            this.y = this.y/value;

            return this;
        }
    }

    /**
     * Subtract this vector by another one.
     * @param {Vec2} other Another vector.
     * @param {boolean} not_in_place If true, creates a new vector. If false, made in place.
     * @returns {Vec2}
     */
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