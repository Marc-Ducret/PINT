export interface ActionInterface {
    type: ActionType;
    toolName: string;
    actionData: any;
}


export enum ActionType {
    Undo,
    Redo,
    Load,
    Resize,
    ToolPreview,
    ToolApply,
}
