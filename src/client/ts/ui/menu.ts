import {UIController} from "./ui";
import {Vec2} from "../vec2";
import * as squareRecon from "../image_utils/squareRecon";
import * as $ from "jquery";

/**
 * Enumeration of possible states of the menu.
 */
export enum MenuState {
    /**
     * No current project, not connected to the server.
     */
    NoProjectOffline,
    /**
     * No current project, connected to the server.
     */
    NoProjectOnline,
    /**
     * In project, not connected to the server.
     */
    InProjectOffline,
    /**
     * In project, connected to the server.
     */
    InProjectOnline,
    /**
     * In project, currently working.
     */
    Working,
}

/**
 * Menu interface controller
 */
export class MenuController {
    elements: any = eval("new Map()");
    displayedCategory: MenuState = MenuState.NoProjectOffline;
    menu_container: HTMLElement;

    constructor (base_element) {
        this.menu_container = base_element;
    }

    /**
     * Add an html element to the menu, with specified responsive dimensions.
     * Dimensions according to a grid of 12 cells.
     * @param {HTMLElement} element
     * @param {{l: number; m: number; s: number}} dimensions Responsive dimensions. l is for desktop. m is for tablets. s is for phones.
     */
    addElement (element: HTMLElement, dimensions: {l: number, m: number, s: number}) {
        let div = document.createElement("div");

        div.className = "col";
        // @todo check that it is an integer between 0 and 12.
        if (dimensions.l > 0) {
            div.className += " l"+dimensions.l;
        }
        if (dimensions.s > 0) {
            div.className += " s"+dimensions.s;
        }
        if (dimensions.m > 0) {
            div.className += " m"+dimensions.m;
        }

        div.appendChild(element);
        $(div).hide();
        this.menu_container
            .appendChild(div);
    }

    /**
     * Set the element to be displayed when the menu state is the specified category.
     * @param {HTMLElement} element
     * @param {MenuState} category
     */
    addElementToCategory (element: HTMLElement, category: MenuState) {
        if (this.elements.get(category) === undefined) {
            this.elements.set(category, []);
        }

        if (category === this.displayedCategory) {
            $(element).parent().show();
        }

        this.elements.get(category).push(element);
    }

    /**
     * Change menu state
     * @param {MenuState} category
     */
    switchCategory (category: MenuState) {
        if (this.displayedCategory == category) {
            return;
        }

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
            }

            $(last_elem).parent().fadeOut(fadeDuration);
            setTimeout(function() {
                for (let elem of this.elements.get(category)) {
                    $(elem).parent().fadeIn(fadeDuration);
                }
            }.bind(this), fadeDuration);
        }
        this.displayedCategory = category;
    }

    /**
     * Update menu status according to project/online status.
     * @param {boolean} project_open
     * @param {boolean} is_online
     */
    updateStatus(project_open: boolean, is_online: boolean) {
        if (project_open) {
            if (is_online) {
                this.switchCategory(MenuState.InProjectOnline);
            } else {
                this.switchCategory(MenuState.InProjectOffline);
            }
        } else {
            if (is_online) {
                this.switchCategory(MenuState.NoProjectOnline);
            } else {
                this.switchCategory(MenuState.NoProjectOffline);
            }
        }
    }
}

/**
 * Create an instance of MenuController and populate it with title, tools, options to create a new project, online mode.
 * @param {UIController} controller
 * @param {HTMLElement} base_element
 * @returns {MenuController}
 */
export function setup_menu(controller: UIController, base_element: HTMLElement) {
    let menu_controller = new MenuController(base_element);

    /*
     * TITLE
     */
    let title = menu_title_create(
        function() {
                menu_controller.updateStatus(controller.hasProjectOpen(), controller.isOnline());
            });
    menu_controller.addElement(title, {l: 2, m: 12, s: 12});

    menu_controller.addElementToCategory(title, MenuState.InProjectOffline);
    menu_controller.addElementToCategory(title, MenuState.InProjectOnline);
    menu_controller.addElementToCategory(title, MenuState.NoProjectOffline);
    menu_controller.addElementToCategory(title, MenuState.NoProjectOnline);
    menu_controller.addElementToCategory(title, MenuState.Working);

    /*
     * SHARE ONLINE
     */
    let share_online_checkbox = menu_share_online_create();
    menu_controller.addElement(share_online_checkbox, {l: 1, m: 6, s: 6});

    menu_controller.addElementToCategory(share_online_checkbox, MenuState.NoProjectOnline);
    menu_controller.addElementToCategory(share_online_checkbox, MenuState.InProjectOnline);


    /*
     * PROJECT NAME
     */
    let filename = menu_filename_create(
        function() {
            controller.filenameUpdate(this.value);
        });
    menu_controller.addElement(filename, {l: 3, m: 12, s: 12});

    menu_controller.addElementToCategory(filename, MenuState.InProjectOffline);
    menu_controller.addElementToCategory(filename, MenuState.InProjectOnline);
    menu_controller.addElementToCategory(filename, MenuState.NoProjectOffline);
    menu_controller.addElementToCategory(filename, MenuState.NoProjectOnline);

    /*
     * NEW PROJECT
     */
    let newproject = menu_newproject_create(function (dimensions) {
        let name = controller.project_name;
        if ($("#share_online_checkbox").is(":checked")) { // Sync project with server.
            window.history.pushState(null, 'PINT - '+name, '?online=true&project='+name);
            controller.loadServerHosted(name, dimensions, "");
        } else { // Offline mode.
            window.history.pushState(null, 'PINT - '+name, '?online=false&project='+name);
            controller.newProject(dimensions);
        }
    });
    menu_controller.addElement(newproject, {l: 3, m: 12, s: 12});

    menu_controller.addElementToCategory(newproject, MenuState.InProjectOffline);
    menu_controller.addElementToCategory(newproject, MenuState.InProjectOnline);
    menu_controller.addElementToCategory(newproject, MenuState.NoProjectOffline);
    menu_controller.addElementToCategory(newproject, MenuState.NoProjectOnline);

    /*
     * LOAD FROM FILE
     */
    let load_image_file = menu_button_create("Load from file", function() {
        controller.newProjectFromFile();
    });
    menu_controller.addElement(load_image_file, {l: 1, m: 6, s: 6});

    menu_controller.addElementToCategory(load_image_file, MenuState.InProjectOffline);
    menu_controller.addElementToCategory(load_image_file, MenuState.InProjectOnline);
    menu_controller.addElementToCategory(load_image_file, MenuState.NoProjectOffline);
    menu_controller.addElementToCategory(load_image_file, MenuState.NoProjectOnline);

    /*
     * BACK
     */
    let back = menu_button_create("Back",
        function() {
            menu_controller.switchCategory(MenuState.Working);
        }
    );
    menu_controller.addElement(back, {l: 1, m: 6, s: 6});

    menu_controller.addElementToCategory(back, MenuState.InProjectOffline);
    menu_controller.addElementToCategory(back, MenuState.InProjectOnline);

    /*
     * TOOLBOX
     */
    let toolbox = menu_toolbox_create(controller);
    menu_controller.addElement(toolbox, {l: 0, m: 0, s: 0});

    menu_controller.addElementToCategory(toolbox, MenuState.Working);

    return menu_controller;
}

/**
 * Create title instance.
 * @param callback Function to call on click.
 * @returns {HTMLElement}
 */
function menu_title_create(callback: () => void): HTMLElement {
    let container = document.createElement("div");
    let a = document.createElement("a");
    a.className = "title";
    a.innerText = "PINT.js";
    a.addEventListener("click", callback);

    let indicator_container = document.createElement("ul");
    indicator_container.className = "indicator-container";

    let indicator = document.createElement("li");
    indicator.className = "indicator orange";
    indicator_container.appendChild(indicator);

    container.appendChild(indicator_container);
    container.appendChild(a);
    return container;
}

/**
 * Create share online switch.
 * @returns {HTMLElement}
 */
function menu_share_online_create(): HTMLElement {
    let p = document.createElement("p");
    p.innerText = "Share online";
    p.id = "share_online_p";
    let div_switch = document.createElement("div");
    div_switch.className = "switch";
    div_switch.innerHTML = "<label>\n" +
        "      <input type=\"checkbox\" id=\"share_online_checkbox\">\n" +
        "      <span class=\"lever\"></span>\n" +
        "    </label>";

    p.appendChild(div_switch);
    return p;
}

/**
 * Create filename input.
 * @param callback
 * @returns {HTMLElement}
 */
function menu_filename_create(callback: () => void): HTMLElement {
    let p = document.createElement("p");
    let input = document.createElement("input");
    input.type = "text";
    input.value = "Untitled";
    input.addEventListener("input", callback);
    p.appendChild(input);
    return p;
}

/**
 * Create new project input.
 * @param callback
 * @returns {HTMLElement}
 */
function menu_newproject_create(callback: (dimensions: Vec2) => void): HTMLElement {
    let p = document.createElement("p");
    p.className = "newproject-container";

    let input = document.createElement("input");
    input.type = "number";
    input.value = "800";
    input.min = "1";
    input.step = "1";

    let input2 = document.createElement("input");
    input2.type = "number";
    input2.value = "600";
    input2.min = "1";
    input2.step = "1";

    let a = document.createElement("a");
    a.className = "btn-large";
    a.innerText = "New project";
    a.addEventListener("click", function() {
        callback(new Vec2(parseInt(<string>$(input).val()), parseInt(<string>$(input2).val())));
    });

    let span = document.createElement("span");
    span.innerText = "x";

    let span2 = document.createElement("span");
    span2.innerText = " ";

    let validateInput = function () {
        let width = <number>$(input).val();
        let height = <number>$(input2).val();

        let surface = width * height;
        if (surface < 32 * 1024 * 1024 && width > 0 && height > 0) {
            // 32 Megapixel limit. Each canvas will consume 128Mo in memory, therefore at least 3*128Mo is consumed.
            // We dont wan't the user to create unbelievably huge image and crash his PC.
            a.className = "btn-large";
            a.innerText = "New project";

            input.className = "valid";
            input2.className = "valid";
        } else {
            a.className = "btn-large disabled";

            if (width <= 0) {
                a.innerText = "New project";
                input.className = "invalid";
            } else if (height <= 0) {
                input2.className = "invalid";
            } else {
                a.innerText = "Too big";
                input.className = "invalid";
                input2.className = "invalid";
            }
        }
    };

    input.addEventListener("input", validateInput);
    input2.addEventListener("input", validateInput);

    p.appendChild(input);
    p.appendChild(span);
    p.appendChild(input2);
    p.appendChild(span2);
    p.appendChild(a);
    return p;
}

/**
 * Create a button.
 * @param text Button text.
 * @param callback Called on button click.
 * @returns {HTMLElement}
 */
function menu_button_create(text: string, callback: () => void): HTMLElement {
    let p = document.createElement("p");
    let a = document.createElement("a");
    a.className = "btn-large flex";
    a.innerText = text;
    a.addEventListener("click", callback);

    p.appendChild(a);
    return p;
}


/*
 * TOOLBOX
 */

/**
 * Create a tool button based on an icon (available from material icons bank).
 * @param {string} tool
 * @param {string} icon
 * @returns {HTMLElement}
 */
function create_tool_entry_icon(tool: string, icon: string): HTMLElement {
    let i = document.createElement("i");
    i.className = "medium material-icons";
    i.dataset.tool = tool;
    i.innerText = icon;
    return i;
}

/**
 * Create a tool button based on an image.
 * @param {string} tool
 * @param {string} asset
 * @returns {HTMLElement}
 */
function create_tool_entry_picture(tool: string, asset: string): HTMLElement {
    let img = document.createElement("img");
    img.dataset.tool = tool;
    img.src = asset;
    return img;
}

/**
 * Create a separator between two groups of tools.
 * @returns {HTMLElement}
 */
function create_separator(): HTMLElement {
    let span = document.createElement("span");
    span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp";
    return span
}

/**
 * Create a function button with a material icon.
 * @param {string} function_call
 * @param {string} description
 * @param {string} icon
 * @returns {HTMLElement}
 */
function create_function_icon(function_call: string, description: string, icon: string): HTMLElement {
    let i = document.createElement("i");
    i.className = "medium material-icons";
    i.dataset.function = function_call;
    i.dataset.desc = description;
    i.innerText = icon;
    return i;
}

/**
 * Every 500ms executes update.
 * @param {HTMLElement} elem
 * @param update
 * @returns {HTMLElement}
 */
function scheduleUpdates(elem: HTMLElement, update: (elem: HTMLElement) => void): HTMLElement {
   setInterval(function() {
        update(elem);
    }, 500);
    return elem;
}

/**
 * Populate toolbox with tools and functions.
 * @param {UIController} controller
 * @returns {HTMLElement}
 */
function menu_toolbox_create(controller: UIController): HTMLElement {
    let p = document.createElement("p");
    p.id = "toolbox-container";

    p.appendChild(create_function_icon("this.project.undo();", "Undo", "undo"));
    p.appendChild(create_function_icon("this.project.redo();", "Redo", "redo"));
    p.appendChild(create_separator());
    p.appendChild(create_function_icon("this.project.saveProject();", "Save", "save"));
    p.appendChild(create_separator());
    p.appendChild(create_tool_entry_icon("HandTool","gamepad"));
    p.appendChild(create_tool_entry_icon("SelectionTool", "photo_size_select_small"));
    p.appendChild(create_tool_entry_picture("AutoSelectTool", "assets/magic.png"));
    p.appendChild(create_tool_entry_icon("EyedropperTool","colorize"));
    p.appendChild(create_separator());
    p.appendChild(create_tool_entry_icon("FreehandTool","brush"));
    p.appendChild(create_tool_entry_icon("LineTool","mode_edit"));
    p.appendChild(create_tool_entry_icon("ShapeTool","check_box_outline_blank"));
    p.appendChild(create_tool_entry_icon("FillTool","format_color_fill"));
    p.appendChild(create_tool_entry_icon("GradientTool","gradient"));
    p.appendChild(create_tool_entry_icon("EraserTool","flip"));
    p.appendChild(create_separator());
    p.appendChild(scheduleUpdates(
        create_function_icon("if(this.project != null) { this.project.testSquare(elem); }", "Test Square", "picture_in_picture"),
        function(elem) {
            if (controller.project != null) {
                controller.project.testSquare(elem);
            }
        }));
    p.appendChild(create_separator());
    p.appendChild(create_tool_entry_icon("CopyTool","flip_to_back"));
    p.appendChild(create_tool_entry_icon("PasteTool","flip_to_front"));

    $.get('assets/net.json', function(data) {
        console.log('loaded network');
        console.log(data);
        squareRecon.initClassifier(data);
    }); //TODO move elsewhere
    return p;
}
