import type { Untyped } from "$types/util";
import type { CircleShort, Ellipse, RotatedEllipse, RotatedRectShort } from "./shapes";
import type { CodeGridSchema } from "./world";

interface CodeGrids {
    blockCategories: string;
    customBlocks: string;
    customBlocksParsed: Untyped[];
}

interface OptionSchema {
    options: Untyped[];
    categories?: Untyped[];
}

interface DeviceInfo {
    id: string;
    name: string;
    description?: string;
    optionSchema: OptionSchema;
    defaultState: any;
    codeGridSchema: CodeGridSchema;
    wireConfig?: Untyped;
    minimumRoleLevel?: number;
    maxOnMap?: number;
    initialMemoryCost?: number;
    subsequentMemoryCost?: number;
    supportedMapStyles?: string[];
    seasonTicketRequired?: boolean;
    maximumRoleLevel?: number;
}

interface ItemOption {
    type: string;
    id: string;
    name: string;
    editorName: string;
    description: string;
    previewImage: string;
    rarity?: string;
    weapon?: Weapon;
    minimumRoleLevel?: number;
    useCommand?: string;
    consumeType?: string;
    terrainId?: string;
    maxStackSize?: number;
}

interface Weapon {
    type: string;
    appearance: string;
    shared: WeaponShared;
    bullet?: { ammoItemId: string };
}

interface WeaponShared {
    cooldownBetweenShots: number;
    allowAutoFire: boolean;
    startingProjectileDistanceFromCharacter: number;
}

interface PropOption {
    id: string;
    name: string;
    scaleMultip: number;
    originX: number;
    originY: number;
    imageUrl: string;
    rectColliders: RotatedRectShort[];
    circleColliders: CircleShort[];
    ellipseColliders: RotatedEllipse[];
    shadows: Ellipse[];
    seasonTicketRequired?: boolean;
    minimumRoleLevel?: number;
    defaultLayer?: string;
}

interface SkinOption {
    id: string;
    name: string;
    minimumRoleLevel?: number;
}

export interface TerrainOption {
    id: string;
    name: string;
    maskTilesUrl: string;
    borderTilesUrl: string;
    fillUrl: string;
    blockedMapStyles?: string[];
    seasonTicketRequired?: boolean;
    previewUrl: string;
    health?: number;
    minimumRoleLevel?: number;
}

interface CustomAssetOption {
    id: string;
    maxOnMap: number;
    memoryCost: number;
    minimumRoleLevel?: number;
    validate: Untyped;
}

export default interface WorldOptions {
    codeGrids: CodeGrids;
    customAssetsOptions: CustomAssetOption[];
    deviceOptions: DeviceInfo[];
    hasAllProps: boolean;
    itemOptions: ItemOption[];
    propsOptions: PropOption[];
    skinOptions: SkinOption[];
    terrainOptions: TerrainOption[];
}
