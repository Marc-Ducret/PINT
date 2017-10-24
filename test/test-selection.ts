
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
                        var result = true;
                        for (var i = 0; i < actual.length; i++) {
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
        for (var i = 0; i < 50; i++) {
            var w = 800;
            var h = 600;
            var selection = new Uint8ClampedArray(w*h);
            for (var i = 0; i < w*h; i++) {
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
                        var result = true;
                        var incr = true;
                        for (var i = 1; i < actual.length; i++) {
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
        var tool = new SelectionTool();
        var proj = new Project('test project');
        for (var i = 0; i < 1; i++) {
            var w = proj.dimensions.x;
            var h = proj.dimensions.y;

            let randPos = function() {
                return new Vec2(Math.floor(Math.random() * w), Math.floor(Math.random() * h));
            };


            tool.startUse(null, randPos(), proj);
            tool.endUse(randPos());

            var row = new Uint8ClampedArray(w);
            for(var y = 0; y < h; y++) {
                for(var x = 0; x < w; x++) {
                    row[x] = proj.currentSelection.values[x + y*w];
                }
                expect(row).isConvex(true);
            }
            var col = new Uint8ClampedArray(h);
            for(var x = 0; x < w; x++) {
                for(var y = 0; y < h; y++) {
                    col[y] = proj.currentSelection.values[x + y*w];
                }
                expect(col).isConvex(true);
            }
        }
    });
});
