define(["require", "exports", "jquery", "../docState", "../tool_settings/settingsInterface", "./viewport", "../tools/toolregistry", "../vec2", "./menu", "./layermenu", "./keyboardManager", "../tools/actionInterface", "./layer", "socket.io-client"], function (require, exports, $, docState_1, settingsInterface_1, viewport_1, toolregistry_1, vec2_1, menu_1, layermenu_1, keyboardManager_1, actionInterface_1, layer_1, io) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UIController {
        constructor() {
            this.mouseMoving = false;
            this.lastPosition = null;
            this.project = null;
            let fallbackImage = document.createElement("img");
            this.viewport = new viewport_1.Viewport($("#viewport"), fallbackImage);
            fallbackImage.addEventListener("load", function () {
                this.viewport.viewportDimensionsChanged();
            }.bind(this));
            fallbackImage.src = "assets/" + (1 + Math.floor(Math.random() * 10)) + ".png";
            this.settingsUI = new settingsInterface_1.SettingsInterface($("#toolsettings_container"));
            this.toolRegistry = new toolregistry_1.ToolRegistry();
            this.menu_controller = menu_1.setup_menu(this, document.getElementById("top-nav"));
            this.project_name = "Untitled";
            this.redraw = true;
            this.is_online = false;
            let indicator = $(".indicator");
            let on_failed = function () {
                console.log("Socket disconnected");
                this.is_online = false;
                if (this.menu_controller.displayedCategory !== menu_1.MenuState.Working) {
                    this.menu_controller.updateStatus(this.hasProjectOpen(), this.isOnline());
                }
                indicator.removeClass("green");
                indicator.removeClass("orange");
                indicator.addClass("red");
            }.bind(this);
            let on_connection_pending = function () {
                console.log("Socket connection pending");
                this.is_online = false;
                if (this.menu_controller.displayedCategory !== menu_1.MenuState.Working) {
                    this.menu_controller.updateStatus(this.hasProjectOpen(), this.isOnline());
                }
                indicator.removeClass("green");
                indicator.addClass("orange");
                indicator.removeClass("red");
            }.bind(this);
            let on_connected = function () {
                console.log("Socket connected with id " + this.socket.id);
                this.is_online = true;
                if (this.menu_controller.displayedCategory !== menu_1.MenuState.Working) {
                    this.menu_controller.updateStatus(this.hasProjectOpen(), this.isOnline());
                }
                indicator.addClass("green");
                indicator.removeClass("orange");
                indicator.removeClass("red");
            }.bind(this);
            if (io != undefined) {
                this.socket = io.connect('//');
                this.socket.on("connect", on_connected);
                this.socket.on("reconnect", on_connected);
                this.socket.on("reconnecting", on_connection_pending);
                this.socket.on("reconnect_error", on_failed);
                this.socket.on("reconnect_failed", on_failed);
                this.socket.on("disconnect", on_failed);
                this.socket.on("connect_error", on_failed);
                this.socket.on("connect_timeout", on_failed);
                this.socket.on("error", on_failed);
                this.socket.on("joined", this.loadServerHostedCallback.bind(this));
            }
            this.keyboard_manager = new keyboardManager_1.KeyboardManager(this);
            this.keyboard_manager.registerBinding("Ctrl-a", function () {
                if (this.project != null) {
                    this.project.applyAction({
                        type: actionInterface_1.ActionType.ToolApply,
                        toolName: "SelectionTool",
                        actionData: {
                            firstCorner: { x: 0, y: 0 },
                            lastCorner: this.project.dimensions,
                            width: this.project.dimensions.x,
                            height: this.project.dimensions.y
                        },
                        toolSettings: { shape: "square" }
                    }, this.project.currentSelection);
                }
            }.bind(this));
            let url = new URL(window.location.href);
            let online = url.searchParams.get("online");
            let project_name = url.searchParams.get("project");
            if (online != null && project_name != null) {
                if (online == "true") {
                    this.socket.emit('join', { "name": project_name, "dimensions": new vec2_1.Vec2(800, 600), "image_data": "" });
                }
                else {
                }
            }
            window.requestAnimationFrame(this.onStep.bind(this));
        }
        filenameUpdate(new_title) {
            if (this.project != null) {
                this.project.name = new_title;
            }
            this.project_name = new_title;
        }
        loadServerHosted(name, dimensions, image_data) {
            this.socket.emit('join', { "name": name, "dimensions": dimensions, "image_data": image_data });
        }
        loadServerHostedCallback(data) {
            console.log("My name is " + data.name);
            this.newProject(data.dimensions);
            this.project.enableNetwork(this.socket);
            for (let i = 0; i < data.data.length; i++) {
                if (i != 0) {
                    this.project.layerList.push(new layer_1.Layer(data.dimensions));
                }
                this.project.layerList[i].layerInfo.copyFrom(data.infos[i]);
                let img = new Image;
                img.onload = function () {
                    this.project.layerList[i].getContext().globalCompositeOperation = "copy";
                    this.project.layerList[i].getContext().drawImage(img, 0, 0);
                    this.project.layerList[i].getContext().globalCompositeOperation = "source-over";
                    this.project.redraw = true;
                }.bind(this);
                img.src = data.data[i];
            }
            this.layer_menu_controller = layermenu_1.setup_layer_menu(this, document.getElementById("layerManager_container"));
        }
        newProjectFromFile() {
            let input = document.createElement("input");
            input.type = "file";
            input.accept = ".jpg, .jpeg, .png";
            input.setAttribute("style", "display:none");
            let self = this;
            input.addEventListener("change", function (event) {
                let selectedFile = event.target.files[0];
                let reader = new FileReader();
                let imgtag = document.createElement("img");
                reader.onload = function (event) {
                    imgtag.src = reader.result;
                    imgtag.addEventListener("load", function () {
                        if ($("#share_online_checkbox").is(":checked")) {
                            self.menu_controller.switchCategory(menu_1.MenuState.Working);
                            self.redraw = true;
                            self.loadServerHosted(self.project_name, new vec2_1.Vec2(imgtag.width, imgtag.height), reader.result);
                        }
                        else {
                            self.newProject(new vec2_1.Vec2(imgtag.width, imgtag.height));
                            self.project.currentLayer.getContext().drawImage(imgtag, 0, 0);
                        }
                    });
                };
                reader.readAsDataURL(selectedFile);
            });
            document.body.appendChild(input);
            input.click();
            return false;
        }
        newProject(dimensions) {
            this.menu_controller.switchCategory(menu_1.MenuState.Working);
            this.redraw = true;
            this.project = new docState_1.Project(this, this.project_name, dimensions);
            $("#toolbox-container").children().removeClass("hovered");
            this.layer_menu_controller = layermenu_1.setup_layer_menu(this, document.getElementById("layerManager_container"));
        }
        hasProjectOpen() {
            return this.project !== null;
        }
        isOnline() {
            return this.is_online;
        }
        addLayer() {
            if (this.project != null) {
                this.project.addLayer();
            }
        }
        selectLayer(i) {
            this.project.selectLayer(i);
            layermenu_1.highlight_layer(this, i);
        }
        deleteLayer(i) {
            if (this.project != null) {
                this.project.deleteLayer(i);
            }
        }
        setTool(tool) {
            if (this.project != null) {
                this.project.changeTool(tool);
                this.settingsUI.setupToolSettings(tool, this.project);
                $("#toolbox-container").children().removeClass("hovered");
                let toolbox = document.getElementById("toolbox-container");
                for (let i = 0; i < toolbox.children.length; i++) {
                    let child = toolbox.children[i];
                    if (child.getAttribute("data-tool") == tool.getName()) {
                        child.className += " hovered";
                    }
                }
                UIController.displayName(tool.getDesc());
            }
        }
        onToolboxClicked(event) {
            let toolname = event.target.getAttribute("data-tool");
            if (toolname !== null) {
                let tool = this.toolRegistry.getToolByName(toolname);
                if (tool !== null) {
                    tool.icon = event.target;
                    this.setTool(tool);
                    event.target.className += " hovered";
                }
                else {
                    console.warn("No such tool " + toolname);
                }
            }
            else {
                let func = event.target.getAttribute("data-function");
                if (func !== null) {
                    let elem = event.target;
                    eval(func);
                }
                else {
                    console.warn("Unimplemented tool.");
                }
            }
            eval("$(\".button-collapse-left\").sideNav('hide');");
        }
        ;
        static displayName(name) {
            $("#name_container").html(name);
        }
        onToolboxHovered(event) {
            let toolname = event.target.getAttribute("data-tool");
            if (toolname !== null) {
                let tool = this.toolRegistry.getToolByName(toolname);
                UIController.displayName(tool.getDesc());
            }
            else {
                let desc = event.target.getAttribute("data-desc");
                UIController.displayName(desc);
            }
        }
        onToolboxHoverLeft(event) {
            if (this.project == null) {
                UIController.displayName("");
                return;
            }
            let tool = this.project.getCurrentTool();
            if (tool != null) {
                UIController.displayName(tool.getDesc());
            }
            else {
                UIController.displayName("");
            }
        }
        onMouseDown(event) {
            this.lastPosition = this.viewport.globalToLocalPosition(new vec2_1.Vec2(event.offsetX, event.offsetY));
            this.mouseMoving = true;
            if (this.project != null) {
                this.project.mouseClick(this.lastPosition.floor());
            }
        }
        ;
        onMouseUp(event) {
            this.lastPosition = this.viewport.globalToLocalPosition(new vec2_1.Vec2(event.offsetX, event.offsetY));
            this.mouseMoving = false;
            if (this.project != null) {
                this.project.mouseRelease(this.lastPosition.floor());
            }
        }
        ;
        onMouseMove(event) {
            this.lastPosition = this.viewport.globalToLocalPosition(new vec2_1.Vec2(event.offsetX, event.offsetY));
            if (this.mouseMoving && this.project != null) {
                this.project.mouseMove(this.lastPosition.floor());
            }
            this.redraw = true;
        }
        ;
        onMouseWheel(event) {
            let ofsX = this.viewport.viewportDimensions.x / 2 - event.offsetX;
            let ofsY = this.viewport.viewportDimensions.y / 2 - event.offsetY;
            let zoom_scale = 1;
            if (event.deltaMode == 1) {
                zoom_scale *= 17;
            }
            let oldScale = this.viewport.getScale();
            this.zoom(event.deltaY * zoom_scale);
            let newScale = this.viewport.getScale();
            let deltaX = -ofsX * (oldScale - newScale) / oldScale;
            let deltaY = -ofsY * (oldScale - newScale) / oldScale;
            this.translate(new vec2_1.Vec2(deltaX, deltaY));
        }
        ;
        zoom(value) {
            this.viewport.setScale(this.viewport.getScale() * Math.pow(1.001, value));
            this.redraw = true;
        }
        translate(translation) {
            let realTranslation = this.viewport.getTranslation().add(translation.divide(this.viewport.getScale(), true), true);
            this.viewport.setTranslation(realTranslation);
            this.redraw = true;
        }
        onStep(timestamp) {
            if (this.project != null) {
                if (this.project.renderSelection()) {
                    this.redraw = true;
                }
                if (this.project.redraw) {
                    this.redraw = true;
                }
            }
            if (this.redraw) {
                if (this.project != null) {
                    this.viewport.renderLayers(this.project.layerList, this.project.previewLayers.values(), this.project.layerList.indexOf(this.project.currentLayer), this.project.replaceLayer, [this.project.currentSelection]);
                }
                else {
                    this.viewport.renderLayers([], null, 0, false, []);
                }
            }
            this.redraw = false;
            window.requestAnimationFrame(this.onStep.bind(this));
        }
        ;
        onWindowResize(newSize) {
            let offset = $("#viewport").offset();
            $("#viewport").height(newSize.y - offset.top);
            this.viewport.viewportDimensionsChanged();
        }
        ;
        bindEvents(toolbox_container, viewport, newproject_button, newproject_width, newproject_height) {
            toolbox_container.children().click(this.onToolboxClicked.bind(this));
            toolbox_container.children().hover(this.onToolboxHovered.bind(this), this.onToolboxHoverLeft.bind(this));
            viewport.mousedown(this.onMouseDown.bind(this));
            viewport.mouseup(this.onMouseUp.bind(this));
            viewport.mousemove(this.onMouseMove.bind(this));
            viewport.mouseleave(this.onMouseUp.bind(this));
            document.getElementById("viewport").addEventListener('wheel', this.onMouseWheel.bind(this));
            document.getElementById("viewport").addEventListener('touchstart', onTouch);
            document.getElementById("viewport").addEventListener('touchmove', onTouch);
            document.getElementById("viewport").addEventListener('touchend', onTouch);
            document.getElementById("viewport").addEventListener('touchcancel', onTouch);
            document.getElementById("viewport").addEventListener('touchleave', onTouch);
            newproject_button.click(function () {
                this.newProject(new vec2_1.Vec2(newproject_width.val(), newproject_height.val()));
            }.bind(this));
            $(window).on('resize', (function (e) {
                this.onWindowResize(new vec2_1.Vec2($(window).width(), $(window).height()));
            }).bind(this));
            this.onWindowResize(new vec2_1.Vec2($(window).width(), $(window).height()));
            document.body.addEventListener('touchmove', function (event) {
                event.preventDefault();
            }, false);
            document.addEventListener("keyup", this.keyboard_manager.handleEvent.bind(this.keyboard_manager));
        }
    }
    exports.UIController = UIController;
    function onTouch(evt) {
        evt.preventDefault();
        if (evt.touches.length > 1 || (evt.type == "touchend" && evt.touches.length > 0))
            return;
        let newEvt = document.createEvent("MouseEvents");
        let type = null;
        let touch = null;
        switch (evt.type) {
            case "touchstart":
                type = "mousedown";
                touch = evt.changedTouches[0];
                break;
            case "touchmove":
                type = "mousemove";
                touch = evt.changedTouches[0];
                break;
            case "touchend":
                type = "mouseup";
                touch = evt.changedTouches[0];
                break;
        }
        newEvt.initMouseEvent(type, true, true, document.defaultView, 0, touch.screenX, touch.screenY, touch.clientX, touch.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);
        evt.target.dispatchEvent(newEvt);
    }
});
//# sourceMappingURL=ui.js.map