import type EventEmitter from 'events';

export interface Event {
    // complex type
    context: any;
    fn: any;
    once: boolean;
}

interface GameEvents {
    boot: Event[];
    destroy: Event[];
    pause: Event;
    preupdate: Event[];
    shutdown: Event[];
    sleep: Event;
    start: Event[];
    transitioncomplete: Event;
    transitionout: Event;
    transitionstart: Event;
    update: Event[];
}

export type GimkitEventEmmiter = Omit<
    EventEmitter,
    'getMaxListeners' | 'prependListener' | 'prependOnceListener' | 'rawListeners' | 'setMaxListeners'
>;

export default interface Events extends GimkitEventEmmiter {
    _events: GameEvents;
    _eventsCount: number;
    // prototype
    destroy: any;
    shutdown: any;
}