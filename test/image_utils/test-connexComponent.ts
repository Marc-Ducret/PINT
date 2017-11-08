import {colorSelect} from "../../src/ts/image_utils/connexComponent";
import {Vec2} from "../../src/ts/vec2";
import {isSelected} from "../../src/ts/selection/selectionUtils";

describe("Testing connex component features", function() {
    describe("Testing color select feature on 10x10 picture.", function() {
        let image = new ImageData(10, 10);
        for (let i=1; i<9;i++) {
            image.data[4*(i+1*10)] = 255;
            image.data[4*(i+8*10)] = 255;
        }

        for (let i=1; i<9;i++) {
            image.data[4*(8+i*10)] = 255;
            image.data[4*(1+i*10)] = 255;
        }

        describe('First connex component', function() {
            let cc_1 = colorSelect(image, new Vec2(0,0), 0);

            it('(9,0) is in the first connex component', function() {
                expect(isSelected(cc_1, 9, 0, 10, 10)).toBe(true);
            });
            it('(9,1) is not in the first connex component', function() {
                expect(isSelected(cc_1, 8, 1, 10, 10)).toBe(false);
            });
            it('(9,2) is not in the first connex component', function() {
                expect(isSelected(cc_1, 7, 2, 10, 10)).toBe(false);
            });
        });

        describe('Second connex component', function() {
            let cc_2 = colorSelect(image, new Vec2(1,1), 0);

            it('(9,0) is not in the second connex component', function() {
                expect(isSelected(cc_2, 9, 0, 10, 10)).toBe(false);
            });
            it('(9,1) is in the second connex component', function() {
                expect(isSelected(cc_2, 8, 1, 10, 10)).toBe(true);
            });
            it('(9,2) is not in the second connex component', function() {
                expect(isSelected(cc_2, 7, 2, 10, 10)).toBe(false);
            });
        });

        describe('Thrid connex component', function() {
            let cc_3 = colorSelect(image, new Vec2(2,2), 0);

            it('(9,0) is not in the third connex component', function() {
                expect(isSelected(cc_3, 9, 0, 10, 10)).toBe(false);
            });
            it('(9,1) is not in the third connex component', function() {
                expect(isSelected(cc_3, 8, 1, 10, 10)).toBe(false);
            });
            it('(9,2) is in the third connex component', function() {
                expect(isSelected(cc_3, 7, 2, 10, 10)).toBe(true);
            });
        })
    });
});
