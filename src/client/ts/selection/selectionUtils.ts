import {Vec2} from "../vec2";

/**
 * Naive implementation of selection masking on image data.
 * @param {Uint8ClampedArray} selection Selection array
 * @param {ImageData} img Image data
 * @returns {ImageData}
 */
export function mask(selection: Uint8ClampedArray, img: ImageData) {
    selection.forEach(function(value: number, index: number) {
        img.data[4*index+3] = value*img.data[4*index+3]/255;
    });
    return img;
}

/**
 * Check if a point is in a selection.
 * @param {Uint8ClampedArray} selection Given selection.
 * @param x Point x.
 * @param y Point y.
 * @param w Image width.
 * @param h Image height.
 * @returns {boolean}
 */
export function isSelected(selection: Uint8ClampedArray, x: number, y: number, w: number, h: number) {
    return x >= 0 && x < w && y >= 0 && y < h && selection[x + y * w] > 0;
}

/**
 * When given a selection, computes its border.
 * @param {Uint8ClampedArray} selection Given selection.
 * @param {number} w Image width.
 * @param {number} h Image height.
 * @returns {Array<Vec2>}
 */
export function computeBorder(selection: Uint8ClampedArray, w: number, h: number) : Array<Vec2> {
    let border: Array<Vec2> = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if(inBorder(x, y, selection, w, h)) {
                border.push(new Vec2(x, y));
            }
        }
    }
    return border;
}

/**
 * Returns if the (x, y) pixel is in the border of the selection.
 * @param {number} x First coordinate
 * @param {number} y Second coordinate
 * @param {Uint8ClampedArray} selection Selection array
 * @param {number} w Image width
 * @param {number} h Image height
 * @returns {boolean}
 */
export function inBorder(x: number, y: number, selection: Uint8ClampedArray, w: number, h: number) {
    return (isSelected(selection, x, y, w, h)
            && (!isSelected(selection, x-1, y, w, h)
                ||  !isSelected(selection, x, y-1, w, h)
                ||  !isSelected(selection, x+1, y, w, h)
                ||  !isSelected(selection, x, y+1, w, h)));
}