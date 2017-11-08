
import {UIController} from "./ui";
import {Vec2} from "../vec2";
import {cat} from "shelljs";

export class MenuController {
    elements: Map<number, Array<HTMLElement>> = new Map();
    displayedCategory: number = 0;
    menu_container: HTMLElement;

    constructor (base_element) {
        this.menu_container = base_element;
    }

    addElement (element: HTMLElement, dimensions: number) {
        let div = document.createElement("div");

        div.className = "col";
        if (dimensions > 0) {// @todo check that it is an integer between 0 and 12.
            div.className += " s"+dimensions;
        }

        div.appendChild(element);
        $(div).hide();
        this.menu_container
            .appendChild(div);
    }

    addElementToCategory (element: HTMLElement, category: number) {
        if (this.elements.get(category) === undefined) {
            this.elements.set(category, []);
        }

        if (category === this.displayedCategory) {
            $(element).parent().show();
        }

        this.elements.get(category).push(element);
    }

    switchCategory (category: number) {
        if (this.elements.get(this.displayedCategory) === undefined) {
            this.elements.set(this.displayedCategory, []);
        }

        if (this.elements.get(category) === undefined) {
            this.elements.set(category, []);
        }

        let to_hide = [];

        for (let elem of this.elements.get(this.displayedCategory)) {
            let ok = true;
            for (let elem2 of this.elements.get(category)) {
                if (elem == elem2) {
                    ok = false;
                }
            }

            if (ok) {
                to_hide.push(elem);
            }
        }

        const fadeDuration = 150;

        if (to_hide.length == 0) {
            for (let elem of this.elements.get(category)) {
                $(elem).parent().fadeIn(fadeDuration);
            }
        } else {
            let last_elem = to_hide.pop();
            for (let elem of to_hide) {
                $(elem).parent().fadeOut(fadeDuration);
                console.log("fadeout");
            }

            $(last_elem).parent().fadeOut(fadeDuration);
            setTimeout(function() {
                console.log("fadein");
                for (let elem of this.elements.get(category)) {
                    $(elem).parent().fadeIn(fadeDuration);
                }
            }.bind(this), fadeDuration);
        }
        this.displayedCategory = category;
    }
}

export function setup_menu(controller: UIController, base_element: HTMLElement) {
    let menu_controller = new MenuController(base_element);

    let title = menu_title_create(
        function() {
            menu_controller.switchCategory(0)
        });
    menu_controller.addElement(title, 2);
    menu_controller.addElementToCategory(title, 0);
    menu_controller.addElementToCategory(title, 1);

    let filename = menu_filename_create(
        function() {
            controller.filenameUpdate((<HTMLInputElement>filename).value)
        });

    menu_controller.addElement(filename, 3);
    menu_controller.addElementToCategory(filename, 1);

    let newproject = menu_newproject_create(function (dimensions) {
        controller.newProject(dimensions);
    });
    menu_controller.addElement(newproject, 3);
    menu_controller.addElementToCategory(newproject, 0);

    let load_image_file = menu_load_image_file_create(function() {
        controller.loadImageFromFile();
    });
    menu_controller.addElement(load_image_file, 1);
    menu_controller.addElementToCategory(load_image_file, 0);

    let back = menu_back_create(
        function() {
            menu_controller.switchCategory(1);
        }
    );
    menu_controller.addElement(back, 1);
    menu_controller.addElementToCategory(back, 0);
    $(back).parent().hide();

    let toolbox = menu_toolbox_create();
    menu_controller.addElement(toolbox, 0);
    menu_controller.addElementToCategory(toolbox, 1);

    return menu_controller;
}

function menu_title_create(callback): HTMLElement {
    let a = document.createElement("a");
    a.className = "title";
    a.innerText = "PINT.js";
    a.addEventListener("click", callback);
    return a;
}

function menu_filename_create(callback): HTMLElement {
    let p = document.createElement("p");
    let input = document.createElement("input");
    input.type = "text";
    input.value = "Untitled";
    input.addEventListener("change", callback);
    p.appendChild(input);
    return p;
}

function menu_newproject_create(callback): HTMLElement {
    let p = document.createElement("p");
    p.className = "newproject-container";

    let input = document.createElement("input");
    input.type = "number";
    input.value = "800";
    input.min = "1";

    let input2 = document.createElement("input");
    input2.type = "number";
    input2.value = "600";
    input2.min = "1";

    let a = document.createElement("a");
    a.className = "btn-large";
    a.innerText = "New project";
    a.addEventListener("click", function() {
        callback(new Vec2(<number>$(input).val(), <number>$(input2).val()));
    });

    let span = document.createElement("span");
    span.innerText = "x";

    let span2 = document.createElement("span");
    span2.innerText = " ";



    p.appendChild(input);
    p.appendChild(span);
    p.appendChild(input2);
    p.appendChild(span2);
    p.appendChild(a);
    return p;
}

function menu_load_image_file_create(callback): HTMLElement {
    let p = document.createElement("p");
    let a = document.createElement("a");
    a.className = "btn-large";
    a.innerText = "Load from file";
    a.addEventListener("click", callback);

    p.appendChild(a);
    return p;
}
function menu_back_create(callback): HTMLElement {
    let p = document.createElement("p");
    let a = document.createElement("a");
    a.className = "btn-large flex";
    a.innerText = "Back";
    a.addEventListener("click", callback);

    p.appendChild(a);
    return p;
}

function create_tool_entry_icon(tool: string, icon: string): HTMLElement {
    let i = document.createElement("i");
    i.className = "medium material-icons";
    i.dataset.tool = tool;
    i.innerText = icon;
    return i;
}

function create_tool_entry_picture(tool: string, asset: string): HTMLElement {
    let img = document.createElement("img");
    img.className = "medium material-icons";
    img.dataset.tool = tool;
    img.dataset.src = asset;
    return img;
}

function create_separator(): HTMLElement {
    let span = document.createElement("span");
    span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp";
    return span
}

function create_function_icon(function_call: string, description: string, icon: string): HTMLElement {
    let i = document.createElement("i");
    i.className = "medium material-icons";
    i.dataset.function = function_call;
    i.dataset.desc = description;
    i.innerText = icon;
    return i;
}

function menu_toolbox_create(): HTMLElement {
    let p = document.createElement("p");
    p.id = "toolbox-container";

    p.appendChild(create_separator());
    p.appendChild(create_function_icon("this.project.saveProject();", "Save", "save"));
    p.appendChild(create_separator());
    p.appendChild(create_tool_entry_icon("HandTool","gamepad"));
    p.appendChild(create_tool_entry_icon("SelectionTool", "photo_size_select_small"));
    p.appendChild(create_tool_entry_picture("AutoSelectTool", "asssets/magic.png"));
    p.appendChild(create_separator());
    p.appendChild(create_tool_entry_icon("FreehandTool","brush"));
    p.appendChild(create_tool_entry_icon("LineTool","mode_edit"));
    p.appendChild(create_tool_entry_icon("ShapeTool","check_box_outline_blank"));
    p.appendChild(create_tool_entry_icon("FillTool","format_color_fill"));
    p.appendChild(create_separator());
    p.appendChild(create_function_icon("this.zoom(50);","Zoom in","zoom_in"));
    p.appendChild(create_function_icon("this.zoom(-50);","Zoom out","zoom_out"));

    return p;
}