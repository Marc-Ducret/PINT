describe('Selection border', function () {

    beforeEach(function () {
        jasmine.addMatchers({
            isDisjoint: function () {
                return {
                    compare: function (actual, expected) {
                        var result = true;
                        for (var i = 0; i < actual.length; i++) {
                            if(actual[i] > 0 && expected > 0) {
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
            var selection = [];
            var w = 800;
            var h = 600;
            for (var i = 0; i < w*h; i++) {
                if (Math.random() > .95) {
                    selection.push(1);
                } else {
                    selection.push(0);
                }
            }
            expect(computeBorder(selection, w, h)).isDisjoint(selection);
        }
    });
});
