define(["require", "exports", "../vec2", "../image_utils/squareRecon", "jquery"], function (require, exports, vec2_1, squareRecon, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MenuState;
    (function (MenuState) {
        MenuState[MenuState["NoProjectOffline"] = 0] = "NoProjectOffline";
        MenuState[MenuState["NoProjectOnline"] = 1] = "NoProjectOnline";
        MenuState[MenuState["InProjectOffline"] = 2] = "InProjectOffline";
        MenuState[MenuState["InProjectOnline"] = 3] = "InProjectOnline";
        MenuState[MenuState["Working"] = 4] = "Working";
    })(MenuState = exports.MenuState || (exports.MenuState = {}));
    class MenuController {
        constructor(base_element) {
            this.elements = new Map();
            this.displayedCategory = MenuState.NoProjectOffline;
            this.menu_container = base_element;
        }
        addElement(element, dimensions) {
            let div = document.createElement("div");
            div.className = "col";
            if (dimensions.l > 0) {
                div.className += " l" + dimensions.l;
            }
            if (dimensions.s > 0) {
                div.className += " s" + dimensions.s;
            }
            if (dimensions.m > 0) {
                div.className += " m" + dimensions.m;
            }
            div.appendChild(element);
            $(div).hide();
            this.menu_container
                .appendChild(div);
        }
        addElementToCategory(element, category) {
            if (this.elements.get(category) === undefined) {
                this.elements.set(category, []);
            }
            if (category === this.displayedCategory) {
                $(element).parent().show();
            }
            this.elements.get(category).push(element);
        }
        switchCategory(category) {
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
            }
            else {
                let last_elem = to_hide.pop();
                for (let elem of to_hide) {
                    $(elem).parent().fadeOut(fadeDuration);
                }
                $(last_elem).parent().fadeOut(fadeDuration);
                setTimeout(function () {
                    for (let elem of this.elements.get(category)) {
                        $(elem).parent().fadeIn(fadeDuration);
                    }
                }.bind(this), fadeDuration);
            }
            this.displayedCategory = category;
        }
        updateStatus(project_open, is_online) {
            if (project_open) {
                if (is_online) {
                    this.switchCategory(MenuState.InProjectOnline);
                }
                else {
                    this.switchCategory(MenuState.InProjectOffline);
                }
            }
            else {
                if (is_online) {
                    this.switchCategory(MenuState.NoProjectOnline);
                }
                else {
                    this.switchCategory(MenuState.NoProjectOffline);
                }
            }
        }
    }
    exports.MenuController = MenuController;
    function setup_menu(controller, base_element) {
        let menu_controller = new MenuController(base_element);
        let title = menu_title_create(function () {
            menu_controller.updateStatus(controller.hasProjectOpen(), controller.isOnline());
        });
        menu_controller.addElement(title, { l: 2, m: 12, s: 12 });
        menu_controller.addElementToCategory(title, MenuState.InProjectOffline);
        menu_controller.addElementToCategory(title, MenuState.InProjectOnline);
        menu_controller.addElementToCategory(title, MenuState.NoProjectOffline);
        menu_controller.addElementToCategory(title, MenuState.NoProjectOnline);
        menu_controller.addElementToCategory(title, MenuState.Working);
        let share_online_checkbox = menu_share_online_create();
        menu_controller.addElement(share_online_checkbox, { l: 1, m: 6, s: 6 });
        menu_controller.addElementToCategory(share_online_checkbox, MenuState.NoProjectOnline);
        menu_controller.addElementToCategory(share_online_checkbox, MenuState.InProjectOnline);
        let filename = menu_filename_create(function () {
            controller.filenameUpdate(this.value);
        });
        menu_controller.addElement(filename, { l: 3, m: 12, s: 12 });
        menu_controller.addElementToCategory(filename, MenuState.InProjectOffline);
        menu_controller.addElementToCategory(filename, MenuState.InProjectOnline);
        menu_controller.addElementToCategory(filename, MenuState.NoProjectOffline);
        menu_controller.addElementToCategory(filename, MenuState.NoProjectOnline);
        let newproject = menu_newproject_create(function (dimensions) {
            let name = controller.project_name;
            if ($("#share_online_checkbox").is(":checked")) {
                window.history.pushState(null, 'PINT - ' + name, '?online=true&project=' + name);
                controller.loadServerHosted(name, dimensions, "");
            }
            else {
                window.history.pushState(null, 'PINT - ' + name, '?online=false&project=' + name);
                controller.newProject(dimensions);
            }
        });
        menu_controller.addElement(newproject, { l: 3, m: 12, s: 12 });
        menu_controller.addElementToCategory(newproject, MenuState.InProjectOffline);
        menu_controller.addElementToCategory(newproject, MenuState.InProjectOnline);
        menu_controller.addElementToCategory(newproject, MenuState.NoProjectOffline);
        menu_controller.addElementToCategory(newproject, MenuState.NoProjectOnline);
        let load_image_file = menu_button_create("Load from file", function () {
            controller.newProjectFromFile();
        });
        menu_controller.addElement(load_image_file, { l: 1, m: 6, s: 6 });
        menu_controller.addElementToCategory(load_image_file, MenuState.InProjectOffline);
        menu_controller.addElementToCategory(load_image_file, MenuState.InProjectOnline);
        menu_controller.addElementToCategory(load_image_file, MenuState.NoProjectOffline);
        menu_controller.addElementToCategory(load_image_file, MenuState.NoProjectOnline);
        let back = menu_button_create("Back", function () {
            menu_controller.switchCategory(MenuState.Working);
        });
        menu_controller.addElement(back, { l: 1, m: 6, s: 6 });
        menu_controller.addElementToCategory(back, MenuState.InProjectOffline);
        menu_controller.addElementToCategory(back, MenuState.InProjectOnline);
        let toolbox = menu_toolbox_create(controller);
        menu_controller.addElement(toolbox, { l: 0, m: 0, s: 0 });
        menu_controller.addElementToCategory(toolbox, MenuState.Working);
        return menu_controller;
    }
    exports.setup_menu = setup_menu;
    function menu_title_create(callback) {
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
    function menu_share_online_create() {
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
    function menu_filename_create(callback) {
        let p = document.createElement("p");
        let input = document.createElement("input");
        input.type = "text";
        input.value = "Untitled";
        input.addEventListener("input", callback);
        p.appendChild(input);
        return p;
    }
    function menu_newproject_create(callback) {
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
        a.addEventListener("click", function () {
            callback(new vec2_1.Vec2(parseInt($(input).val()), parseInt($(input2).val())));
        });
        let span = document.createElement("span");
        span.innerText = "x";
        let span2 = document.createElement("span");
        span2.innerText = " ";
        let validateInput = function () {
            let width = $(input).val();
            let height = $(input2).val();
            let surface = width * height;
            if (surface < 32 * 1024 * 1024 && width > 0 && height > 0) {
                a.className = "btn-large";
                a.innerText = "New project";
                input.className = "valid";
                input2.className = "valid";
            }
            else {
                a.className = "btn-large disabled";
                if (width <= 0) {
                    a.innerText = "New project";
                    input.className = "invalid";
                }
                else if (height <= 0) {
                    input2.className = "invalid";
                }
                else {
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
    function menu_button_create(text, callback) {
        let p = document.createElement("p");
        let a = document.createElement("a");
        a.className = "btn-large flex";
        a.innerText = text;
        a.addEventListener("click", callback);
        p.appendChild(a);
        return p;
    }
    function create_tool_entry_icon(tool, icon) {
        let i = document.createElement("i");
        i.className = "medium material-icons";
        i.dataset.tool = tool;
        i.innerText = icon;
        return i;
    }
    function create_tool_entry_picture(tool, asset) {
        let img = document.createElement("img");
        img.dataset.tool = tool;
        img.src = asset;
        return img;
    }
    function create_separator() {
        let span = document.createElement("span");
        span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp";
        return span;
    }
    function create_function_icon(function_call, description, icon) {
        let i = document.createElement("i");
        i.className = "medium material-icons";
        i.dataset.function = function_call;
        i.dataset.desc = description;
        i.innerText = icon;
        return i;
    }
    function scheduleUpdates(elem, update) {
        return elem;
    }
    function menu_toolbox_create(controller) {
        let p = document.createElement("p");
        p.id = "toolbox-container";
        p.appendChild(create_function_icon("this.project.undo();", "Undo", "undo"));
        p.appendChild(create_function_icon("this.project.redo();", "Redo", "redo"));
        p.appendChild(create_separator());
        p.appendChild(create_function_icon("this.project.saveProject();", "Save", "save"));
        p.appendChild(create_separator());
        p.appendChild(create_tool_entry_icon("HandTool", "gamepad"));
        p.appendChild(create_tool_entry_icon("SelectionTool", "photo_size_select_small"));
        p.appendChild(create_tool_entry_picture("AutoSelectTool", "assets/magic.png"));
        p.appendChild(create_tool_entry_icon("EyedropperTool", "colorize"));
        p.appendChild(create_separator());
        p.appendChild(create_tool_entry_icon("FreehandTool", "brush"));
        p.appendChild(create_tool_entry_icon("LineTool", "mode_edit"));
        p.appendChild(create_tool_entry_icon("ShapeTool", "check_box_outline_blank"));
        p.appendChild(create_tool_entry_icon("FillTool", "format_color_fill"));
        p.appendChild(create_tool_entry_icon("GradientTool", "gradient"));
        p.appendChild(create_tool_entry_icon("EraserTool", "flip"));
        p.appendChild(create_separator());
        p.appendChild(scheduleUpdates(create_function_icon("if(this.project != null) { this.project.testSquare(elem); }", "Test Square", "picture_in_picture"), function (elem) {
            if (controller.project != null) {
                controller.project.testSquare(elem);
            }
        }));
        p.appendChild(create_separator());
        p.appendChild(create_tool_entry_icon("CopyTool", "flip_to_back"));
        p.appendChild(create_tool_entry_icon("PasteTool", "flip_to_front"));
        $.get('assets/net.json', function (data) {
            console.log('loaded network');
            console.log(data);
            squareRecon.initClassifier(data);
        });
        return p;
    }
});
//# sourceMappingURL=menu.js.map