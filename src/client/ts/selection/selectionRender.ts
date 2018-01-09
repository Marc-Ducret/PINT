import {Vec2} from "../vec2";

/**
 * Renders a border to a canvas.
 * @param {Array<Vec2>} border Border to render.
 * @param {ImageData} img Image data to update.
 * @param {number} w Canvas width.
 * @param {number} h Canvas height.
 * @deprecated Now the border is drawn by the viewport
 */
export function drawSelection(img: ImageData, border: Array<Vec2>, w: number, h: number) {
    const pattern = 10;
    const period = 500;
    const offset = (Date.now() % period) * pattern * 2 / period;
    for (let i in border) {
        const x = border[i].x;
        const y = border[i].y;
        if (((x + y + offset) / pattern) % 2 < 1) {
            img.data[(x + y * w) * 4] = 0xFF;
            img.data[(x + y * w) * 4 + 1] = 0xFF;
            img.data[(x + y * w) * 4 + 2] = 0xFF;
            img.data[(x + y * w) * 4 + 3] = 0xFF;
        } else {
            img.data[(x + y * w) * 4] = 0x0;
            img.data[(x + y * w) * 4 + 1] = 0x0;
            img.data[(x + y * w) * 4 + 2] = 0x0;
            img.data[(x + y * w) * 4 + 3] = 0xFF;
        }
    }
}

/**
 * Makes the selected border transparent.
 * @param {ImageData} img
 * @param {Array<Vec2>} border
 * @param {number} w
 * @param {number} h
 */
export function resetBorder(img: ImageData, border: Array<Vec2>, w: number, h: number) {
    for (let i in border) {
        const x = border[i].x;
        const y = border[i].y;
        img.data[(x + y * w) * 4 + 3] = 0x0;
    }
}
