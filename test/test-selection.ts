
import {SelectionTool} from '../src/ts/tools/selectionTool';
import {Project} from '../src/ts/docState';
import {Vec2} from '../src/ts/vec2';
import {computeBorder} from "../src/ts/selection/selectionUtils";

declare global {
    export namespace jasmine {
        interface Matchers<T> {
            isDisjoint(expected: Uint8ClampedArray) : boolean;
            isConvex(expected: boolean) : boolean;
        }
    }
}

describe('Selection border', function () {

    beforeEach(function () {
        jasmine.addMatchers({
            isDisjoint: function () {
                return {
                    compare: function (actual, expected) {
                        let result = true;
                        for (let i = 0; i < actual.length; i++) {
                            if(actual[i] > 0 && expected[i] > 0) {
                                result = false;
                            }
                        }
                        return {
                            pass: result
                        };
                    }
                }
            }
        });
    });

    it('is disjoint with the selection', function() {
        for (let i = 0; i < 5; i++) {
            const w = 20;
            const h = 20;
            let selection = new Uint8ClampedArray(w*h);
            for (let i = 0; i < w*h; i++) {
                if (Math.random() > .95) {
                    selection[i] = 0xFF;
                }
            }
            expect(computeBorder(selection, w, h)).isDisjoint(selection);
        }
    });
});

describe('Shape selection', function () {
    beforeEach(function () {
        jasmine.addMatchers({
            isConvex: function () {
                return {
                    compare: function (actual, expected) {
                        let result = true;
                        let incr = true;
                        for (let i = 1; i < actual.length; i++) {
                            if(actual[i] < actual[i-1] && incr) {
                                incr = false;
                            } else if(actual[i] > actual[i-1] && !incr) {
                                result = false;
                            }
                        }
                        return {
                            pass: result == expected
                        };
                    }
                }
            }
        });
    });

    it('is convex', function() {
        let tool = new SelectionTool();
        let proj = new Project(null, 'test project', new Vec2(20,20));
        for (let i = 0; i < 5; i++) {
            const w = 20;
            const h = 20;

            let randPos = function() {
                return new Vec2(Math.floor(Math.random() * w), Math.floor(Math.random() * h));
            };

            proj.currentSelection.reset();

            tool.settingsSetGetter('shape', () => 'circle');

            tool.startUse(null, randPos(), proj);
            tool.endUse(randPos());

            let row = new Uint8ClampedArray(w);
            for(let y = 0; y < h; y++) {
                if(Math.random() < 1) {
                    for(let x = 0; x < w; x++) {
                        row[x] = proj.currentSelection.getValues()[x + y*proj.dimensions.x];
                    }
                    expect(row).isConvex(true);
                }
            }
            let col = new Uint8ClampedArray(h);
            for(let x = 0; x < w; x++) {
                if(Math.random() < 1) {
                    for(let y = 0; y < h; y++) {
                        col[y] = proj.currentSelection.getValues()[x + y*proj.dimensions.x];
                    }
                    expect(col).isConvex(true);
                }
            }
        }
    });
});
