
import {giveMeTheAnswer, randomModification} from "../src/client/ts/test-file";

declare global {
    export namespace jasmine {
        interface Matchers<T> {
            toBeBetweenZeroAndOne(expected: number) : boolean;
        }
    }
}

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
        let a = Math.random()*15;
        expect(randomModification(a) - a + 0.5).toBeBetweenZeroAndOne(0);
    })
});



