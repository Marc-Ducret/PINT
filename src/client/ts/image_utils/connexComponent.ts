import {Vec2} from "../vec2";

/**
 * Converts (x,y) coordinates of a matrix array to its linear index.
 * @param {Vec2} p Position to convert.
 * @param {number} img_width Image width.
 * @returns {number}
 */
function flatten(p: Vec2, img_width: number) {
    return p.x + img_width * p.y;
}

/**
 * Gives as a PixelSelection array the connected component of the picture containing a given point.
 * @param {ImageData} img Picture to explore.
 * @param {Vec2} pos Starting point of exploration.
 * @returns {Uint8ClampedArray}
 */
export function colorSelect(img: ImageData, pos: Vec2, threshold: number): Uint8ClampedArray {
    let w = img.width;
    let h = img.height;
    let toVisit: Array<Vec2> = [pos];
    let selection = new Uint8ClampedArray(w*h);

    /**
     * Contains the exploration status of pixels. (0 is not explored, 1 is pending, 2 is done.)
     * @type {Uint8ClampedArray}
     */
    let explored = new Uint8ClampedArray(w*h);
    explored[flatten(pos,w)] = 1;

    /**
     * Returns the integer corresponding to the pixel color of a flattened position.
     * @param {number} i The flattened position.
     * @returns {number}
     */
    let color = function(i: number): number {
        return  (img.data[i * 4 + 3] << 24)
            +   (img.data[i * 4 + 2] << 16)
            +   (img.data[i * 4 + 1] << 8)
            +   (img.data[i * 4    ] << 0);
    };

    /**
     * Add a position in the stack only if it has not be seen yet.
     * @param {Vec2} p Position to add.
     */
    let addNeighbour = function(p: Vec2) {
        if(explored[flatten(p,w)] === 0 && p.x >= 0 && p.x < w && p.y >= 0 && p.y < h) {
            explored[flatten(p,w)] = 1;
            toVisit.push(p);
        }
    };

    let indexToMatch = flatten(pos, w);

    /**
     * Returns the mean color component distance from the pixel at i to the pixel to match.
     * @param {number} i The flattened position.
     * @returns {number}
     */
    let dist = function(i: number): number {
        let s = 0;
        for(let j = 0; j < 3; j++) {
            s += Math.abs(img.data[i * 4 + j] - img.data[indexToMatch * 4 + j]);
        }
        return s;
    };

    /**
     * Depth first search to gather pixels of the connected component.
     */
    while(toVisit.length > 0) {
        let p: Vec2 = toVisit.pop();
        let i = flatten(p,w);

        if(explored[i] === 1) {
            if(dist(i) / 3 <= threshold) { // Here we can adjust the precision (might not need to be the exact same color)
                selection[i] = 0xFF;
                explored[i] = 2;
                addNeighbour(new Vec2(p.x + 1, p.y));
                addNeighbour(new Vec2(p.x - 1, p.y));
                addNeighbour(new Vec2(p.x, p.y + 1));
                addNeighbour(new Vec2(p.x, p.y - 1));
            }
        }
    }
    return selection;
}
