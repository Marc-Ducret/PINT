import {Vec2} from "../vec2";

export function drawSelection(border: Array<Vec2>, ctx: CanvasRenderingContext2D, w: number, h: number) {
    let img = ctx.getImageData(0, 0, w, h);

    const pattern = 10;
    const period = 500;
    const offset = (Date.now() % period) * pattern * 2 / period;
    for (let i in border) {
        const x = border[i].x;
        const y = border[i].y;
        if(((x + y + offset) / pattern) % 2 < 1) {
            img.data[(x + y * w) * 4] = 0xFF;
            img.data[(x + y * w) * 4 + 1] = 0xFF;
            img.data[(x + y * w) * 4 + 2] = 0xFF;
            img.data[(x + y * w) * 4 + 3] = 0xFF;
        } else {
            img.data[(x + y * w) * 4] = 0x0;
            img.data[(x + y * w) * 4 + 3] = 0xFF;
        }
    }

    ctx.putImageData(img, 0, 0);
}
