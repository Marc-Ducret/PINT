import {Vec2} from '../src/ts/vec2';
import {Layer} from '../src/ts/ui/layer';

describe('Layer ', function () {

    it('blank layer is blank', function() {
        expect(new Layer(new Vec2(50, 50)).isBlank()).toEqual(true);
    });

    it('not blank layer is not blank', function() {
        let layer = new Layer(new Vec2(50, 50));
        layer.getContext().fillRect(0, 0, 10, 10);
        expect(layer.isBlank()).toEqual(false);
    })
});
