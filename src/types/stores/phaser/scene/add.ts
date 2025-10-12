import type Scene from './scene';
import type Events from './events';
import type { GimkitEventEmmiter } from './events';
import type { DisplayList } from './common';

interface Prototype {
    arc: any;
    bitmapMask: any;
    bitmapText: any;
    blitter: any;
    boot: any;
    circle: any;
    container: any;
    curve: any;
    destroy: any;
    dom: any;
    dynamicBitmapText: any;
    ellipse: any;
    existing: any;
    extern: any;
    follower: any;
    graphics: any;
    grid: any;
    group: any;
    image: any;
    isobox: any;
    isotriangle: any;
    layer: any;
    line: any;
    mesh: any;
    nineslice: any;
    particles: any;
    path: any;
    plane: any;
    pointlight: any;
    polygon: any;
    rectangle: any;
    renderTexture: any;
    rope: any;
    shader: any;
    shutdown: any;
    spine: any;
    sprite: any;
    star: any;
    start: any;
    text: any;
    tileSprite: any;
    tilemap: any;
    timeline: any;
    triangle: any;
    tween: any;
    tweenchain: any;
    video: any;
    zone: any;
}

interface UpdateList extends GimkitEventEmmiter {
    // complex
    active: any[];
    _destroy: any[];
    _events: any;
    _eventsCount: number;
    _pending: any[];
    _toProcess: number;
    checkQueue: boolean;
    scene: Scene;
    // complex
    systems: any;

    // prototype
    boot: any;
    destroy: any;
    sceneUpdate: any;
    shutdown: any;
    start: any;
    add: any;
    getActive: any;
    isActive: any;
    isDestroying: any;
    isPending: any;
    length: number;
    remove: any;
    removeAll: any;
    update: any;
}

export default interface Add extends Prototype {
    displayList: DisplayList;
    events: Events;
    scene: Scene;
    // Complex
    systems: any;
    updateList: UpdateList;
}