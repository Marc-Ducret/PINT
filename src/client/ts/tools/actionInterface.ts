/**
 * Interface that contains all the data a tool needs to be applied. It can be send over network.
 */
export interface ActionInterface {
    /**
     * Action type
     */
    type: ActionType;
    /**
     * Tool name
     */
    toolName: string;
    /**
     * Tool internal state
     */
    actionData: any;
    /**
     * Tool parameters
     */
    toolSettings: { [name: string]: any };
}

/**
 * Available actions.
 */
export enum ActionType {
    /**
     * Draw user pointer.
     */
    DrawUser,
    /**
     * Add a layer.
     */
    AddLayer,
    /**
     * Delete a layer.
     */
    DeleteLayer,
    /**
     * Temporary action that is transformed in ToolApply with history data.
     */
    ToolApplyHistory,
    /**
     * Cancel action.
     */
    Undo,
    /**
     * Redo cancelled action.
     */
    Redo,
    /**
     * Load image.
     */
    Load,
    /**
     * Resize document.
     */
    Resize,
    /**
     * Preview tool action.
     */
    ToolPreview,
    /**
     * Apply tool action.
     */
    ToolApply,
    /**
     * Update Layer info action
     */
    UpdateLayerInfo,
    /**
     * Exchange Layers action
     */
    ExchangeLayers,
}
