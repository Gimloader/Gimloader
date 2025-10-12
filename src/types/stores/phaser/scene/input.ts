import type { Coords } from '$types/stores/common';
import type { DisplayList } from './common';
import type { Event, GimkitEventEmmiter } from './events';
import type Scene from './scene';

interface EventContainer {
    stopPropagation: any;
}

interface EventData {
    cancelled: boolean;
}

interface Events {
    gameout: Event;
    gameover: Event;
    pointerdown: Event;
    pointermove: Event;
    pointerup: Event;
}

interface PluginEvents extends GimkitEventEmmiter {
    _events: {
        destroy: Event;
        shutdown: Event;
        start: Event;
    };
    _eventsCount: number;
}

interface Prototype extends Coords {
    activePointer: any;
    addPointer: any;
    boot: any;
    clear: any;
    destroy: any;
    disable: any;
    enable: any;
    enableDebug: any;
    forceDownState: any;
    forceOutState: any;
    forceOverState: any;
    forceState: any;
    forceUpState: any;
    getDragState: any;
    hitTestPointer: any;
    isActive: any;
    isOver: boolean;
    makePixelPerfect: any;
    mousePointer: any;
    onGameOut: any;
    onGameOver: any;
    pointer1: any;
    pointer2: any;
    pointer3: any;
    pointer4: any;
    pointer5: any;
    pointer6: any;
    pointer7: any;
    pointer8: any;
    pointer9: any;
    pointer10: any;
    preUpdate: any;
    processDownEvents: any;
    processDragDownEvent: any;
    processDragMoveEvent: any;
    processDragStartList: any;
    processDragThresholdEvent: any;
    processDragUpEvent: any;
    processMoveEvents: any;
    processOutEvents: any;
    processOverEvents: any;
    processOverOutEvents: any;
    processUpEvents: any;
    processWheelEvent: any;
    queueForInsertion: any;
    queueForRemoval: any;
    removeDebug: any;
    resetCursor: any;
    resetPointers: any;
    setCursor: any;
    setDefaultCursor: any;
    setDragState: any;
    setDraggable: any;
    setGlobalTopOnly: any;
    setHitArea: any;
    setHitAreaCircle: any;
    setHitAreaEllipse: any;
    setHitAreaFromTexture: any;
    setHitAreaRectangle: any;
    setHitAreaTriangle: any;
    setPollAlways: any;
    setPollOnMove: any;
    setPollRate: any;
    setTopOnly: any;
    shutdown: any;
    sortDropZoneHandler: any;
    sortDropZones: any;
    sortGameObjects: any;
    start: any;
    stopPropagation: any;
    transitionComplete: any;
    transitionIn: any;
    transitionOut: any;
    update: any;
    updatePoll: any;
}

export default interface Input extends Prototype {
    _drag: Record<string, any[]>;
    _dragState: number[];
    _draggable: any[];
    _eventContainer: EventContainer;
    _eventData: EventData;
    _events: Events;
    _eventsCount: number;
    // complex
    _list: any[];
    _over: Record<string, any[]>;
    _pendingInsertion: any[];
    _pendingRemoval: any[];
    _pollTimer: number;
    _temp: any[];
    _tempZones: any[];
    _updatedThisFrame: boolean;
    _validTypes: string[];
    // complex
    cameras: any;
    displayList: DisplayList;
    dragDistanceThreshold: number;
    dragTimeThreshold: number;
    enabled: boolean;

    // complex
    keyboard: any;
    manager: any;
    mouse: any;

    pluginEvents: PluginEvents;
    pollRate: number;
    scene: Scene;

    // complex
    settings: any;
    systems: any;

    topOnly: boolean;
}