
describe('The answer', function () {

    beforeEach(function () {
        jasmine.addMatchers({
            toBeBetweenZeroAndOne: function () {
                return {
                    compare: function (actual, expected) {
                        return {
                            pass: actual >= 0 && actual <= 1
                        };
                    }
                }
            }
        });
    });

    it('gives the answer', function() {
        expect(giveMeTheAnswer()).toEqual(42);
    });

    it('random gives a number between zero and one', function() {
        expect(giveMeANumberBetweenZeroAndOne()).toBeBetweenZeroAndOne();
    })
});



