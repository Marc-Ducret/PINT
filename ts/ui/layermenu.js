var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../tools/actionInterface", "./layer", "../vec2"], function (require, exports, actionInterface_1, layer_1, vec2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LayerMenuController {
        constructor(base_element) {
            this.menu_container = base_element;
        }
        addElement(element) {
            let div = document.createElement("div");
            div.appendChild(element);
            this.menu_container
                .appendChild(div);
        }
    }
    exports.LayerMenuController = LayerMenuController;
    function setup_layer_menu(controller, base_element) {
        $(base_element).empty();
        let layer_menu_controller = new LayerMenuController(base_element);
        let layer_list = controller.project.getLayerList();
        let l = layer_list.length;
        for (let i = 0; i < l; i++) {
            let layer = layer_list[i];
            let div = $("<div/>");
            let p = $("<p/>");
            let del_button = $("<span/>");
            del_button.click(function () {
                controller.deleteLayer(i);
            });
            del_button.mouseover(function () {
                $(this).css("background-color", "#333333");
            });
            del_button.mouseout(function () {
                $(this).css("background-color", "transparent");
            });
            del_button.attr("style", "color:#888888; cursor:pointer; border-radius: 10px;"
                + "padding-left: 2px; padding-right: 2px; padding-top: 2px; padding-bottom: 2px;"
                + "padding-radius: 10px; font-size: 15px");
            del_button.attr("title", "click to delete this layer");
            del_button.addClass("medium material-icons");
            del_button.text("close");
            del_button.appendTo(p);
            let layer_elem = $("<span/>");
            layer_elem.attr("id", "layer" + i.toString());
            layer_elem.attr("style", "color:white; cursor:pointer; border-radius: 10px;"
                + "padding-left: 10px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px;"
                + "padding-radius: 10px;");
            layer_elem.text(layer.layerInfo.name);
            layer_elem.click(function () {
                controller.selectLayer(i);
            });
            let edit_menu = $("<div/>");
            let edit_button = $("<span/>");
            edit_button.click(function () {
                if (edit_menu.contents().length > 0) {
                    layer.editMenuOpened = false;
                    edit_menu.empty();
                    edit_menu.removeAttr("style");
                }
                else {
                    layer.editMenuOpened = true;
                    edit_menu.css("background-color", "#555555");
                    edit_menu.css("border-radius", "20px");
                    edit_menu.css("padding", "20px");
                    let name_field = $("<div class='input-field inline'/>");
                    let name_input = $("<input id='layerName' type='text' class='validate'>");
                    name_input.attr("placeholder", layer.layerInfo.name);
                    name_input.blur(function () {
                        let name = name_input.get(0).value;
                        let info = layer.layerInfo.clone();
                        info.name = name;
                        controller.project.updateLayerInfo(layer, info);
                    });
                    name_input.appendTo(name_field);
                    name_field.appendTo(edit_menu);
                    let addButton = function (text, onclick, title) {
                        let button = $("<span/>");
                        button.addClass("medium material-icons");
                        button.mouseover(function () {
                            $(this).css("background-color", "#333333");
                        });
                        button.mouseout(function () {
                            $(this).css("background-color", "transparent");
                        });
                        button.css("border-radius", "10px");
                        button.css("padding", "10px");
                        button.attr("title", title);
                        button.text(text);
                        button.click(function () {
                            onclick(button);
                        });
                        button.appendTo(edit_menu);
                    };
                    addButton(layer.layerInfo.blur ? "blur_off" : "blur_on", function (button) {
                        if (button.get(0).textContent == "blur_on") {
                            let info = layer.layerInfo.clone();
                            info.blur = true;
                            controller.project.updateLayerInfo(layer, info);
                        }
                        else {
                            let info = layer.layerInfo.clone();
                            info.blur = false;
                            controller.project.updateLayerInfo(layer, info);
                        }
                    }, "Blur");
                    addButton(layer.layerInfo.shadow ? "layers_clear" : "layers", function (button) {
                        if (button.get(0).textContent == "layers") {
                            let info = layer.layerInfo.clone();
                            info.shadow = true;
                            controller.project.updateLayerInfo(layer, info);
                        }
                        else {
                            let info = layer.layerInfo.clone();
                            info.shadow = false;
                            controller.project.updateLayerInfo(layer, info);
                        }
                    }, "Shadow");
                    addButton(layer.layerInfo.show ? "visibility" : "visibility_off", function (button) {
                        if (button.get(0).textContent == "visibility") {
                            let info = layer.layerInfo.clone();
                            info.show = false;
                            controller.project.updateLayerInfo(layer, info);
                        }
                        else {
                            let info = layer.layerInfo.clone();
                            info.show = true;
                            controller.project.updateLayerInfo(layer, info);
                        }
                    }, "Show");
                    if (i > 0) {
                        addButton("call_merge", function (button) {
                            return __awaiter(this, void 0, void 0, function* () {
                                let content = layer.getHTMLElement().toDataURL();
                                let tmp_layer = new layer_1.Layer(new vec2_1.Vec2(layer.getWidth(), layer.getHeight()));
                                tmp_layer.context.filter = layer.layerInfo.getFilter();
                                yield tmp_layer.drawDataUrl(content, 0, 0);
                                content = tmp_layer.getHTMLElement().toDataURL();
                                controller.project.link.sendAction({
                                    type: actionInterface_1.ActionType.ToolApply,
                                    toolName: "PasteTool",
                                    toolSettings: {
                                        project_clipboard: content,
                                        project_clipboard_x: 0,
                                        project_clipboard_y: 0,
                                        layer: i - 1,
                                        mode: "source-over"
                                    },
                                    actionData: { x: 0, y: 0 },
                                });
                                controller.project.deleteLayer(i);
                            });
                        }, "Merge");
                        addButton("arrow_upward", function (button) {
                            controller.project.exchangeLayers(i, i - 1);
                        }, "Go up");
                    }
                    if (i < controller.project.layerList.length - 1) {
                        addButton("arrow_downward", function (button) {
                            controller.project.exchangeLayers(i, i + 1);
                        }, "Go down");
                    }
                }
            });
            if (layer.editMenuOpened) {
                edit_button.click();
            }
            edit_button.mouseover(function () {
                $(this).css("background-color", "#333333");
            });
            edit_button.mouseout(function () {
                $(this).css("background-color", "transparent");
            });
            edit_button.attr("style", "color:#888888; cursor:pointer; border-radius: 10px;"
                + "padding-left: 2px; padding-right: 2px; padding-top: 2px; padding-bottom: 2px;"
                + "padding-radius: 10px; font-size: 15px");
            edit_button.attr("title", "click to toggle edit menu");
            edit_button.addClass("medium material-icons");
            edit_button.text("mode_edit");
            edit_button.appendTo(p);
            layer_elem.appendTo(p);
            p.appendTo(div);
            edit_menu.appendTo(div);
            let HTMLdiv = div.get(0);
            layer_menu_controller.addElement(HTMLdiv);
        }
        let button = $("<a class='waves-effect waves-light btn'/>");
        button.attr("id", "add_layer_button");
        button.css("margin-top", "15px");
        button.text("Add a layer");
        let HTMLbutton = button.get(0);
        HTMLbutton.addEventListener("click", function () {
            controller.addLayer();
        });
        layer_menu_controller.addElement(HTMLbutton);
        document.getElementById("layer0").style.background = "#444444";
        return layer_menu_controller;
    }
    exports.setup_layer_menu = setup_layer_menu;
    function highlight_layer(controller, i) {
        let layer_list = controller.project.getLayerList();
        let l = layer_list.length;
        for (let j = 0; j < l; j++) {
            document.getElementById("layer" + j.toString()).style.background = "transparent";
        }
        document.getElementById("layer" + i.toString()).style.background = "#444444";
    }
    exports.highlight_layer = highlight_layer;
});
//# sourceMappingURL=layermenu.js.map