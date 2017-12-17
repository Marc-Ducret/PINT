export interface ActionInterface {
    type: ActionType;
    toolName: string;
    actionData: any;
    toolSettings: {[name: string]: any };
}


export enum ActionType {
    Undo,
    Redo,
    Load,
    Resize,
    ToolPreview,
    ToolApply,
}
