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
    let l = layer_list.length -2; // -2 to remove the preview layer and the selection layer
    for (let i=0 ; i<l ; i++) { // add layers representations to HTML horizontal bar
        let div = $("<div/>");
        div.attr("layer_id", i);
        let p = $("<p/>");
        p.attr("style", "color:white; cursor:pointer;");
        p.text("layer " + i.toString());
        p.appendTo(div);
        // convert div in a HTML element:
        let HTMLdiv : HTMLElement = <HTMLElement> div.get(0);
        // add a listener to select a layer as current layer when button is clicked:
        HTMLdiv.addEventListener("click", function(){ controller.project.selectLayer(i); } );
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


    return layer_menu_controller;
}
