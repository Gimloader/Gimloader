import type ActionManager from './actionManager';
import type Add from './add';
import type CharacterManager from './characterManager';
import type Events from './events';
import type Input from './input';

interface Children {
    _sortKey: string;
    addCallback: any;
    events: Events;
    // complex
    list: any[];
    parent: Scene;
    position: number;
    removeCallback: any;
    scene: Scene;
    sortChildrenFlag: boolean;
    systems: any;
}

interface Data {
    _frozen: boolean;
    events: Events;
    list: any;
    parent: Scene;
    systems: any;
    values: any;
    boot: any;
    destroy: any;
    shutdown: any;
    start: any;

    count: number;
    each: any;
    freeze: boolean;
    get: any;
    getAll: any;
    has: any;
    inc: any;
    merge: any;
    pop: any;
    query: any;
    remove: any;
    removeValue: any;
    reset: any;
    set: any;
    setFreeze: any;
    toggle: any;
}

export default interface Scene {
    actionManager: ActionManager;
    add: Add;

    // Complex
    anims: any;
    cache: any;
    cameraHelper: any;
    cameras: any;

    characterManager: CharacterManager;
    children: Children;
    create: any;
    data: Data;
    dt: number;
    events: Events;

    // Complex
    game: any;

    input: Input;
    inputManager: any;
    
    // I'm just giving up
    lights: any;
    load: any;
    make: any;
    plugins: any;
    registry: any;
    renderer: any;
    resizeManager: any;
    scale: any;
    scene: any;
    shadowsManager: any;
    sound: any;
    spine: any;
    sys: any;
    textures: any;
    tileManager: any;
    time: any;
    tweens: any;
    uiManager: any;
    worldManager: any;

    update: any;
}