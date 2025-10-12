interface EditingDevice {
    currentlyEditedDevice: any;
    currentlyEditedGridId: string;
    currentlySortedDeviceId: string;
    screen: string;
    sortingState: any[];
    usingMultiselect: boolean;
    visualEditing: any;
}

interface EditingPreferences {
    cameraZoom: number;
    movementSpeed: any;
    phase: any;
    showGrid: any;
    topDownControlsActive: boolean;
}

export interface Editing {
    device: EditingDevice;
    preferences: EditingPreferences;
    wire: { currentlyEditedWireId: string };
}