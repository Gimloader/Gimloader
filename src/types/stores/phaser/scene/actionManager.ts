import type Scene from './scene';

interface Overlay {
    hide: any;
    scene: Scene;
    show: any;
    showing: boolean;
    showingDimensions: any;
    showingPosition: any;
}

interface DepthSort {
    overlay: Overlay;
    scene: Scene;
    update: any;
}

interface SelectedDevicesOverlay {
    // complex
    graphics: any;
    hide: any;
    scene: Scene;
    show: any;
    showing: boolean;
}

interface MultiSelect {
    addDeviceToSelection: any;
    boundingBoxAroundEverything: any;
    currentlySelectedDevices: any[];
    currentlySelectedDevicesIds: string[];
    endSelectionRect: any;
    findSelectedDevices: any;
    hasSomeSelection: any;
    hideSelection: any;
    hidingSelectionForDevices: boolean;
    isSelecting: boolean;
    modifierKeyDown: boolean;
    mouseShifts: any[];
    movedOrCopiedDevices: any[];
    multiselectDeleteKeyHandler: any;
    multiselectKeyHandler: any;
    onDeviceAdded: any;
    onDeviceRemoved: any;
    overlay: Overlay;
    scene: Scene;
    selectedDevices: any[];
    selectedDevicesIds: string[];
    selectedDevicesOverlay: SelectedDevicesOverlay;
    selection: any;
    setShiftParams: any;
    startSelectionRect: any;
    unselectAll: any;
    update: any;
    updateSelectedDevicesOverlay: any;
    updateSelectionRect: any;
}

interface PlatformerEditing {
    setTopDownControlsActive: any;
}

interface Removal {
    checkForItem: any;
    createStateListeners: any;
    overlay: Overlay;
    prevMouseWasDown: boolean;
    removeSelectedItems: any;
    scene: Scene;
    update: any;
}

export default interface ActionManager {
    depthSort: DepthSort;
    multiSelect: MultiSelect;
    platformerEditing: PlatformerEditing;
    removal: Removal;
    update: any;
}