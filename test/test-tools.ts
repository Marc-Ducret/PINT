import {Vec2} from "../src/client/ts/vec2";
import {Project} from "../src/client/ts/docState";
import {ActionInterface} from "../src/client/ts/tools/actionInterface";

describe('History', function () {
    let w = 20;
    let h = 20;
    let randPos = function () {
        return new Vec2(Math.floor(Math.random() * w), Math.floor(Math.random() * h));
    };
    let proj = new Project(null, 'test project', new Vec2(w, h));
    for (let t of proj.toolRegistry.getTools()) {
        let need_ui = false;
        for (let req of t.getSettings().getRequests()) {
            if (req.name == "user_interface") {
                need_ui = true;
            }
        }
        if (!need_ui) {
            it('works with tool ' + t.getName(), async function () {
                proj.currentLayer.reset();
                let initState = proj.currentLayer.getHTMLElement().toDataURL();
                t.startUse(proj.currentLayer.getContext().getImageData(0, 0, w, h), randPos());
                t.continueUse(randPos());
                t.endUse(randPos());
                let undo: Promise<ActionInterface> = t.applyTool(proj.currentLayer, true);
                proj.link.sendAction(await undo);
                let endState = proj.currentLayer.getHTMLElement().toDataURL();
                expect(initState).toEqual(endState);
            });
        }
    }
});