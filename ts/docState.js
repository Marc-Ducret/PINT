var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./ui/layer", "./vec2", "./selection/selection", "./selection/selectionUtils", "./image_utils/squareRecon", "./tools/actionInterface", "./actionLink/networkLink", "./tools/toolregistry", "./actionLink/localLink", "./ui/layermenu"], function (require, exports, layer_1, vec2_1, selection_1, selectionUtils_1, squareRecon, actionInterface_1, networkLink_1, toolregistry_1, localLink_1, layermenu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Project {
        constructor(ui, name, dimensions) {
            this.name = name;
            this.toolRegistry = new toolregistry_1.ToolRegistry();
            if (dimensions == null) {
                this.dimensions = new vec2_1.Vec2(800, 600);
            }
            else {
                this.dimensions = dimensions;
            }
            this.previewLayers = new Map();
            this.currentLayer = new layer_1.Layer(this.dimensions);
            this.workingLayer = new layer_1.Layer(this.dimensions);
            this.layerList = [this.currentLayer];
            this.currentTool = null;
            this.ui = ui;
            this.redraw = false;
            this.replaceLayer = false;
            this.currentSelection = new selection_1.PixelSelectionHandler(this.dimensions.x, this.dimensions.y);
            this.currentLayer.fill();
            this.link = new localLink_1.LocalLink(this);
        }
        enableNetwork(socket) {
            this.link = new networkLink_1.NetworkLink(this, socket);
        }
        getCurrentTool() {
            return this.currentTool;
        }
        getUI() {
            return this.ui;
        }
        changeTool(tool) {
            this.currentTool = tool;
        }
        ;
        mouseClick(vect) {
            if (this.currentTool !== null) {
                this.usingTool = true;
                let img = this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y);
                if (!this.currentTool.overrideSelectionMask) {
                    img = selectionUtils_1.mask(this.currentSelection.getValues(), img);
                }
                this.currentTool.startUse(img, vect);
            }
        }
        ;
        mouseMove(vect) {
            if (this.currentTool !== null && this.usingTool === true) {
                this.currentTool.continueUse(vect);
                let action = {
                    toolName: this.currentTool.getName(),
                    actionData: this.currentTool.getData(),
                    type: actionInterface_1.ActionType.ToolPreview,
                    toolSettings: this.currentTool.getSettings().exportParameters(),
                };
                action.toolSettings["layer"] = this.layerList.indexOf(this.currentLayer);
                action.toolSettings["mouse_x"] = vect.x;
                action.toolSettings["mouse_y"] = vect.y;
                this.setPreviewLayer("localhost");
                this.applyAction(action, this.currentSelection, false);
                if (this.currentTool.getSettings().canBeSentOverNetwork() === true) {
                    this.link.sendAction(action);
                }
            }
            return true;
        }
        ;
        mouseRelease(vect) {
            if (this.currentTool !== null && this.usingTool === true) {
                this.usingTool = false;
                this.currentTool.endUse(vect);
                let action = {
                    toolName: this.currentTool.getName(),
                    actionData: this.currentTool.getData(),
                    type: actionInterface_1.ActionType.ToolApply,
                    toolSettings: this.currentTool.getSettings().exportParameters(),
                };
                action.toolSettings["layer"] = this.layerList.indexOf(this.currentLayer);
                if (this.currentTool.getSettings().canBeSentOverNetwork() === false) {
                    this.applyAction(action, this.currentSelection, false);
                }
                else {
                    this.link.sendAction(action);
                }
            }
        }
        ;
        undo() {
            let action = {
                toolName: "Undo",
                actionData: "",
                type: actionInterface_1.ActionType.Undo,
                toolSettings: {}
            };
            this.link.sendAction(action);
        }
        redo() {
            let action = {
                toolName: "Redo",
                actionData: "",
                type: actionInterface_1.ActionType.Redo,
                toolSettings: {}
            };
            this.link.sendAction(action);
        }
        applyAction(action, selectionHandler, generateHistory) {
            return __awaiter(this, void 0, void 0, function* () {
                switch (action.type) {
                    case actionInterface_1.ActionType.ToolApply: {
                        this.replaceLayer = false;
                        let tool = this.toolRegistry.getToolByName(action.toolName);
                        tool.reset();
                        tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
                        tool.updateData(action.actionData);
                        this.currentPreviewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                        let draw_layer = action.toolSettings["layer"];
                        console.log("Action on layer: " + draw_layer);
                        if (!tool.overrideSelectionMask) {
                            let history_save = "";
                            if (generateHistory) {
                                history_save = this.layerList[draw_layer].getHTMLElement().toDataURL();
                            }
                            if (tool.readahead) {
                                this.currentPreviewLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                                this.layerList[draw_layer].applyInvMask(selectionHandler);
                            }
                            let undo = yield tool.applyTool(this.currentPreviewLayer, generateHistory);
                            if (undo != null && undo.type == actionInterface_1.ActionType.ToolApplyHistory) {
                                undo.type = actionInterface_1.ActionType.ToolApply;
                                undo.toolName = "PasteTool";
                                undo.toolSettings = {
                                    project_clipboard: history_save,
                                    project_clipboard_x: 0,
                                    project_clipboard_y: 0,
                                    layer: draw_layer,
                                    mode: "copy"
                                };
                                undo.actionData = { x: 0, y: 0 };
                            }
                            this.currentPreviewLayer.applyMask(selectionHandler);
                            this.layerList[draw_layer].getContext().drawImage(this.currentPreviewLayer.getHTMLElement(), 0, 0);
                            this.currentPreviewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                            this.redraw = true;
                            return undo;
                        }
                        else {
                            let undo = yield tool.applyTool(this.layerList[draw_layer], generateHistory);
                            this.currentPreviewLayer.getContext().clearRect(0, 0, this.dimensions.x, this.dimensions.y);
                            this.redraw = true;
                            return undo;
                        }
                    }
                    case actionInterface_1.ActionType.ToolPreview: {
                        if (this.ui == null) {
                            return null;
                        }
                        let tool = this.toolRegistry.getToolByName(action.toolName);
                        tool.reset();
                        tool.getSettings().importParameters(action.toolSettings, selectionHandler, this.getUI());
                        tool.updateData(action.actionData);
                        this.currentPreviewLayer.reset();
                        if (tool.readahead) {
                            let draw_layer = action.toolSettings["layer"];
                            this.currentPreviewLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                            this.workingLayer.reset();
                            this.workingLayer.getContext().drawImage(this.layerList[draw_layer].getHTMLElement(), 0, 0);
                            this.replaceLayer = true;
                        }
                        else {
                            this.replaceLayer = false;
                        }
                        tool.drawPreview(this.currentPreviewLayer);
                        if (!tool.overrideSelectionMask) {
                            this.ui.viewport.applyMask(this.currentPreviewLayer, selectionHandler);
                            this.ui.viewport.applyInvMask(this.workingLayer, selectionHandler);
                            this.currentPreviewLayer.getContext().drawImage(this.workingLayer.getHTMLElement(), 0, 0);
                        }
                        this.redraw = true;
                        return null;
                    }
                    case actionInterface_1.ActionType.DeleteLayer: {
                        let i = action.actionData;
                        let indexNewCurrentLayer;
                        for (let j = 0; j < this.layerList.length; j++) {
                            if (this.currentLayer == this.layerList[j]) {
                                if (i < j) {
                                    indexNewCurrentLayer = j - 1;
                                }
                                else {
                                    indexNewCurrentLayer = j;
                                }
                            }
                        }
                        let backupContent;
                        if (i >= this.layerList.length || i < 0) {
                            throw "try to delete a layer that doesn't exist";
                        }
                        else if (this.layerList.length == 1) {
                            console.warn("impossible to delete the only layer remaining");
                        }
                        else if (this.currentLayer == this.layerList[i]) {
                            backupContent = this.layerList[i].getHTMLElement().toDataURL();
                            if (i == this.layerList.length - 1) {
                                indexNewCurrentLayer = i - 1;
                                this.selectLayer(indexNewCurrentLayer);
                            }
                            else {
                                this.selectLayer(i + 1);
                                indexNewCurrentLayer = i;
                            }
                            this.layerList.splice(i, 1);
                        }
                        else {
                            backupContent = this.layerList[i].getHTMLElement().toDataURL();
                            this.layerList.splice(i, 1);
                        }
                        if (this.ui != null) {
                            this.ui.layer_menu_controller = layermenu_1.setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                            layermenu_1.highlight_layer(this.ui, indexNewCurrentLayer);
                        }
                        return {
                            toolName: "AddLayer",
                            actionData: {
                                position: i,
                                content: backupContent
                            },
                            type: actionInterface_1.ActionType.AddLayer,
                            toolSettings: {}
                        };
                    }
                    case actionInterface_1.ActionType.AddLayer: {
                        let l = new layer_1.Layer(this.dimensions);
                        l.reset();
                        this.layerList.splice(action.actionData.position, 0, l);
                        this.currentLayer = l;
                        if (action.actionData.content != "") {
                            yield l.drawDataUrl(action.actionData.content, 0, 0);
                        }
                        if (this.ui != null) {
                            this.ui.layer_menu_controller = layermenu_1.setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                            layermenu_1.highlight_layer(this.ui, action.actionData.position);
                        }
                        return {
                            toolName: "DeleteLayer",
                            actionData: action.actionData.position,
                            type: actionInterface_1.ActionType.DeleteLayer,
                            toolSettings: {}
                        };
                    }
                    case actionInterface_1.ActionType.UpdateLayerInfo: {
                        let prevInfo = this.layerList[action.actionData.position].layerInfo.data();
                        this.layerList[action.actionData.position].layerInfo = new layer_1.LayerInfo();
                        this.layerList[action.actionData.position].layerInfo.copyFrom(action.actionData.content);
                        if (this.ui != null) {
                            this.ui.layer_menu_controller = layermenu_1.setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                            layermenu_1.highlight_layer(this.ui, this.layerList.indexOf(this.currentLayer));
                        }
                        return {
                            toolName: "UpdateLayerInfo",
                            actionData: {
                                position: action.actionData.position,
                                content: prevInfo,
                            },
                            type: actionInterface_1.ActionType.UpdateLayerInfo,
                            toolSettings: {}
                        };
                    }
                    case actionInterface_1.ActionType.ExchangeLayers: {
                        let temp = this.layerList[action.actionData.positionA];
                        this.layerList[action.actionData.positionA] = this.layerList[action.actionData.positionB];
                        this.layerList[action.actionData.positionB] = temp;
                        if (this.ui != null) {
                            this.ui.layer_menu_controller = layermenu_1.setup_layer_menu(this.ui, document.getElementById("layerManager_container"));
                            layermenu_1.highlight_layer(this.ui, this.layerList.indexOf(this.currentLayer));
                        }
                        return action;
                    }
                    case actionInterface_1.ActionType.DrawUser: {
                        let ctx = this.currentPreviewLayer.getContext();
                        let data = action.actionData;
                        ctx.beginPath();
                        ctx.moveTo(data.x, data.y);
                        ctx.lineTo(data.x - 10, data.y - 15);
                        ctx.lineTo(data.x + 10, data.y - 15);
                        ctx.closePath();
                        ctx.fillStyle = data.color;
                        ctx.fill();
                        ctx.font = "20px Arial";
                        ctx.fillText(data.name, data.x - 5, data.y - 17);
                    }
                }
            });
        }
        renderSelection() {
            if (this.currentSelection.getBorder().length > 0) {
                return true;
            }
            else {
                return false;
            }
        }
        getLayerList() {
            return this.layerList;
        }
        ;
        addLayer() {
            let action = {
                toolName: "AddLayer",
                actionData: {
                    position: this.layerList.length,
                    content: ""
                },
                type: actionInterface_1.ActionType.AddLayer,
                toolSettings: {}
            };
            this.link.sendAction(action);
        }
        ;
        selectLayer(i) {
            if (i >= this.layerList.length || i < 0) {
                throw "try to select a layer that doesn't exist";
            }
            else {
                this.currentLayer = this.layerList[i];
            }
        }
        ;
        deleteLayer(i) {
            let action = {
                toolName: "DeleteLayer",
                actionData: i,
                type: actionInterface_1.ActionType.DeleteLayer,
                toolSettings: {}
            };
            this.link.sendAction(action);
        }
        ;
        updateLayerInfo(layer, layerInfo) {
            let action = {
                toolName: "UpdateLayerInfo",
                actionData: {
                    position: this.layerList.indexOf(layer),
                    content: layerInfo.data(),
                },
                type: actionInterface_1.ActionType.UpdateLayerInfo,
                toolSettings: {}
            };
            this.link.sendAction(action);
        }
        exchangeLayers(i, j) {
            let action = {
                toolName: "ExchangeLayers",
                actionData: {
                    positionA: i,
                    positionB: j,
                },
                type: actionInterface_1.ActionType.ExchangeLayers,
                toolSettings: {}
            };
            this.link.sendAction(action);
        }
        ;
        saveProject() {
            this.workingLayer.reset();
            for (let i = 0; i < this.layerList.length; i++) {
                this.workingLayer.getContext().drawImage(this.layerList[i].getHTMLElement(), 0, 0);
            }
            let content = this.workingLayer.getHTMLElement()
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let fake_link = document.createElement('a');
            fake_link.download = this.name + '.png';
            fake_link.href = content;
            document.body.appendChild(fake_link);
            fake_link.click();
            document.body.removeChild(fake_link);
        }
        testSquare(elem) {
            let color;
            if (squareRecon.hasSquare(this.currentLayer.getContext().getImageData(0, 0, this.dimensions.x, this.dimensions.y))) {
                color = "#6aeb70";
            }
            else {
                color = "#cc3058";
            }
            elem.setAttribute("style", "color: " + color);
        }
        setPreviewLayer(sender) {
            if (this.previewLayers.get(sender) == undefined) {
                this.previewLayers.set(sender, new layer_1.Layer(this.dimensions));
                console.log("Created a new layer for " + sender);
            }
            this.currentPreviewLayer = this.previewLayers.get(sender);
        }
    }
    exports.Project = Project;
});
//# sourceMappingURL=docState.js.map