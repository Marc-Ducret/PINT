
import {PixelSelection} from "./selection";
import {Vec2} from "../vec2";

/**
 * Check if a point is in a selection.
 * @param {PixelSelection} selection Given selection.
 * @param x Point x.
 * @param y Point y.
 * @param w Image width.
 * @param h Image height.
 * @returns {boolean}
 */
function isSelected(selection: PixelSelection, x, y, w, h) {
    return x >= 0 && x < w && y >= 0 && y < h && selection[x + y * w] > 0;
}

/**
 * When given a selection, computes its border.
 * @param {PixelSelection} selection Given selection.
 * @param {number} w Image width.
 * @param {number} h Image height.
 * @returns {Array<Vec2>}
 */
export function computeBorder(selection: PixelSelection, w: number, h: number) : Array<Vec2> {
    let border: Array<Vec2> = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if(!isSelected(selection, x, y, w, h)
                && (isSelected(selection, x-1, y+0, w, h)
                    ||  isSelected(selection, x+0, y-1, w, h)
                    ||  isSelected(selection, x+1, y+0, w, h)
                    ||  isSelected(selection, x+0, y+1, w, h))) {
                border.push(new Vec2(x, y));
            }
        }
    }
    return border;
}