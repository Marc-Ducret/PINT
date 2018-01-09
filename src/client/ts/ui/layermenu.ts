import {UIController} from "./ui";

/**
 * Layer manager menu
 */

/**
 * Class that represent the controller for the layer manager menu
 */
export class LayerMenuController {
    menu_container: HTMLElement;

    constructor(base_element) {
        this.menu_container = base_element;
    }

    /**
     * @brief: add an HTMLElement to the layer menu
     * @param {HTMLElement} element
     */
    addElement(element: HTMLElement) {
        let div = document.createElement("div");

        div.appendChild(element);
        this.menu_container
            .appendChild(div);
    }
}

/**
 * Update the layer menu and display it in given HTMLElement
 * @param {UIController} controller
 * @param {HTMLElement} base_element
 * @returns {LayerMenuController} The updated layer menu controller
 */
export function setup_layer_menu(controller: UIController, base_element: HTMLElement) {

    // empty base element to recreate it completely:
    $(base_element).empty();

    let layer_menu_controller = new LayerMenuController(base_element);

    let layer_list = controller.project.getLayerList();
    let l = layer_list.length;
    for (let i = 0; i < l; i++) { // add layers representations to HTML horizontal bar
        let layer = layer_list[i];
        let div = $("<div/>");
        let p = $("<p/>");

        // create delete layer button element:
        let del_button = $("<span/>");
        del_button.click(function () {
            controller.deleteLayer(i);
        });
        del_button.mouseover(function () {
            $(this).css("background-color", "#333333")
        });
        del_button.mouseout(function () {
            $(this).css("background-color", "transparent")
        });
        del_button.attr("style", "color:#888888; cursor:pointer; border-radius: 10px;"
            + "padding-left: 2px; padding-right: 2px; padding-top: 2px; padding-bottom: 2px;"
            + "padding-radius: 10px; font-size: 15px");
        // set help text displayed when mouseover:
        del_button.attr("title", "click to delete this layer");
        // to display the del_button as an icon:
        del_button.addClass("medium material-icons");
        del_button.text("close");
        del_button.appendTo(p);

        // layer element:
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
            } else {
                layer.editMenuOpened = true;
                edit_menu.css("background-color", "#555555");
                edit_menu.css("border-radius", "20px");
                edit_menu.css("padding", "20px");

                let name_field = $("<div class='input-field inline'/>");
                let name_input = $("<input id='layerName' type='text' class='validate'>");
                name_input.attr("placeholder", layer.layerInfo.name)
                name_input.blur(function () {
                    let name = (<HTMLInputElement> name_input.get(0)).value;
                    let info = layer.layerInfo.clone();
                    info.name = name;
                    controller.project.updateLayerInfo(layer, info);
                });
                name_input.appendTo(name_field);
                name_field.appendTo(edit_menu);
                let addButton = function(text, onclick) {
                    let button = $("<span/>");
                    button.addClass("medium material-icons");
                    button.mouseover(function () {
                        $(this).css("background-color", "#333333")
                    });
                    button.mouseout(function () {
                        $(this).css("background-color", "transparent")
                    });
                    button.css("border-radius", "10px");
                    button.css("padding", "10px");
                    button.text(text);
                    button.click(function() {
                        onclick(button);
                    });
                    button.appendTo(edit_menu);
                };
                addButton(layer.layerInfo.blur ? "blur_off" : "blur_on", function (button) {
                    if (button.get(0).textContent == "blur_on") {
                        let info = layer.layerInfo.clone();
                        info.blur = true;
                        controller.project.updateLayerInfo(layer, info);
                    } else {
                        let info = layer.layerInfo.clone();
                        info.blur = false;
                        controller.project.updateLayerInfo(layer, info);
                    }
                });
                addButton(layer.layerInfo.shadow ? "layers_clear" : "layers", function (button) {
                    if (button.get(0).textContent == "layers") {
                        let info = layer.layerInfo.clone();
                        info.shadow = true;
                        controller.project.updateLayerInfo(layer, info);
                    } else {
                        let info = layer.layerInfo.clone();
                        info.shadow = false;
                        controller.project.updateLayerInfo(layer, info);
                    }
                });
                if(i > 0) {
                    addButton("arrow_upward", function(button) {
                        controller.project.exchangeLayers(i, i-1);
                    });
                }
                if(i < controller.project.layerList.length-1) {
                    addButton("arrow_downward", function(button) {
                        controller.project.exchangeLayers(i, i+1);
                    });
                }
            }
        });
        if (layer.editMenuOpened) {
            edit_button.click();
        }
        edit_button.mouseover(function () {
            $(this).css("background-color", "#333333")
        });
        edit_button.mouseout(function () {
            $(this).css("background-color", "transparent")
        });
        edit_button.attr("style", "color:#888888; cursor:pointer; border-radius: 10px;"
            + "padding-left: 2px; padding-right: 2px; padding-top: 2px; padding-bottom: 2px;"
            + "padding-radius: 10px; font-size: 15px");
        // set help text displayed when mouseover:
        edit_button.attr("title", "click to toggle edit menu");
        // to display the del_button as an icon:
        edit_button.addClass("medium material-icons");
        edit_button.text("mode_edit");
        edit_button.appendTo(p);

        layer_elem.appendTo(p);

        p.appendTo(div);
        edit_menu.appendTo(div);
        // convert div in a HTML element:
        let HTMLdiv: HTMLElement = <HTMLElement> div.get(0);
        layer_menu_controller.addElement(HTMLdiv);
    }

    // display the add_button
    let button = $("<a class='waves-effect waves-light btn'/>");
    button.attr("id", "add_layer_button");
    button.css("margin-top", "15px");
    button.text("Add a layer");
    // convert button in a HTML element:
    let HTMLbutton: HTMLElement = <HTMLElement> button.get(0);
    // add a listener to add a layer when button is clicked:
    HTMLbutton.addEventListener("click", function () {
        controller.addLayer();
    });
    layer_menu_controller.addElement(HTMLbutton);

    document.getElementById("layer0").style.background = "#444444";

    return layer_menu_controller;
}

/**
 * Highlight layer of index i (selected layer)
 * @param {UIController} controller
 * @param {number} i Index of selected layer
 */
export function highlight_layer(controller: UIController, i: number) {
    let layer_list = controller.project.getLayerList();
    let l = layer_list.length;
    // erase highlight of all layers:
    for (let j = 0; j < l; j++) {
        document.getElementById("layer" + j.toString()).style.background = "transparent";
    }
    // highlight layer i:
    document.getElementById("layer" + i.toString()).style.background = "#444444";
}