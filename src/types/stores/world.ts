import type { Coords } from './common';

interface Device extends Coords {
    depth: number;
    deviceOption: any;
    existsBeforeReconnect: boolean;
    hooks: any;
    id: string;
    isPreview: boolean;
    layerId: string;
    name: any;
    options: any;
    props: any;
}

interface Devices {
    codeGrids: Map<string, any>;
    devices: Map<string, Device>;
    states: Map<string, any>;
}

interface Tile extends Coords {
    collides: boolean;
    depth: number;
    terrain: string;
}

interface Terrain {
    currentTerrainUpdateId: number;
    modifiedHealth: Map<any, any>;
    queuedTiles: Map<any, any>;
    teamColorTiles: Map<any, any>;
    tiles: Map<string, Tile>;
}

export default interface World {
    customAssets: { customAssets: Map<any, any>; };
    devices: Devices;
    height: number;
    width: number;
    mapOptionsJSON: string;
    terrain: Terrain;
    wires: { wires: Map<any, any>; };
}
