export interface ActionInterface {
    type: ActionType;
    toolName: string;
    actionData: any;
    toolSettings: {[name: string]: any };
}


export enum ActionType {
    AddLayer,
    DeleteLayer,
    ToolApplyHistory,
    Undo,
    Redo,
    Load,
    Resize,
    ToolPreview,
    ToolApply,
}
