import {UIController} from "./ui";

/**
 * layer manager menu
 */

/**
 * @brief: class that represent the controller for the layer manager menu
 */
export class LayerMenuController {
    menu_container: HTMLElement;

    constructor (base_element) {
        this.menu_container = base_element;
    }

    /**
     * @brief: add an HTMLElement to the layer menu
     * @param {HTMLElement} element
     */
    addElement (element: HTMLElement) {
        let div = document.createElement("div");

        div.appendChild(element);
        this.menu_container
            .appendChild(div);
    }
}

/**
 * @ brief: update the layer menu and display it in given HTMLElement
 * @param {UIController} controller
 * @param {HTMLElement} base_element
 * @returns {LayerMenuController}: the updated layer menu controller
 */
export function setup_layer_menu(controller: UIController, base_element: HTMLElement) {

    // empty base element to recreate it completely:
    $(base_element).empty();

    let layer_menu_controller = new LayerMenuController(base_element);

    let layer_list = controller.project.getLayerList();
    let l = layer_list.length;
    for (let i=0 ; i<l ; i++) { // add layers representations to HTML horizontal bar
        let div = $("<div/>");
        let p = $("<p/>");

        // create delete layer button element:
        let del_button = $("<span/>");
        del_button.text("delete");
        del_button.click(function () { controller.deleteLayer(i); });
        del_button.mouseover(function () { $(this).css("background-color", "#333333") });
        del_button.mouseout(function () { $(this).css("background-color", "transparent") });
        del_button.attr("style", "color:#888888; cursor:pointer; border-radius: 10px;"
            +"padding-left: 2px; padding-right: 2px; padding-top: 2px; padding-bottom: 2px;"
            +"padding-radius: 10px;");
        // set help text displayed when mouseover:
        del_button.attr("title", "click to delete this layer");
        // to display the del_button as an icon:
        del_button.addClass("medium material-icons");
        del_button.text("close");
        del_button.appendTo(p);

        // layer element:
        let span = $("<span/>");
        span.attr("id", "layer"+i.toString());
        span.attr("style", "color:white; cursor:pointer; border-radius: 10px;"
            +"padding-left: 10px; padding-right: 10px; padding-top: 2px; padding-bottom: 2px;"
            +"padding-radius: 10px;");
        span.text("layer " + i.toString());
        span.click(function() { controller.selectLayer(i); } );
        span.appendTo(p);

        p.appendTo(div);
        // convert div in a HTML element:
        let HTMLdiv : HTMLElement = <HTMLElement> div.get(0);
        layer_menu_controller.addElement(HTMLdiv);
        }

    // display the add_button
    let button = $("<button/>");
    button.attr("id", "add_layer_button");
    button.attr("type", "button");
    button.attr("style", "color:#777777;");
    button.text("Add a layer");
    // convert button in a HTML element:
    let HTMLbutton : HTMLElement = <HTMLElement> button.get(0);
    // add a listener to add a layer when button is clicked:
    HTMLbutton.addEventListener("click", function(){ controller.addLayer(); } );
    layer_menu_controller.addElement(HTMLbutton);

    document.getElementById("layer0").style.background = "#444444";

    return layer_menu_controller;
}

/**
 * @ brief: highlight layer of index i (selected layer)
 * @param {UIController} controller
 * @param {number} i: index of selected layer
 */
export function highlight_layer(controller: UIController, i: number) {
    let layer_list = controller.project.getLayerList();
    let l = layer_list.length;
    // erase highlight of all layers:
    for (let j=0 ; j<l ; j++) {
        document.getElementById("layer"+j.toString()).style.background = "transparent";
    }
    // highlight layer i:
    document.getElementById("layer"+i.toString()).style.background = "#444444";
}