import type Events from './events';
import type Scene from './scene';

export interface DisplayList {
    _sortKey: string;
    addCallback: any;
    events: Events;
    list: any[];
    parent: Scene;
    position: number;
    removeCallback: any;
    scene: Scene;
    sortChildrenFlag: boolean;
    systems: any;
}