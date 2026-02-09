interface ShopItem {
    cosmetic: {
        id: string;
        name: string;
        description: string;
        type: string;
        rarity: string;
    };
    owned: boolean;
    currencyCost: number;
}

export interface Shop {
    now: number;
    endUnix: number;
    items: ShopItem[];
}

export interface Pack {
    id: string;
    name: string;
    color: string;
    currencyCost: number;
}

interface BareCosmetic {
    id: string;
    name: string;
    type: string;
    rarity: string;
}

export interface OwnedCosmetic {
    count: number;
    cosmetic: BareCosmetic;
}

export interface PackCosmeticItem {
    cosmeticId: string;
    count: number;
}

export interface OpenedCosmetic {
    cosmeticId: string;
    owned: boolean;
}

export interface PackCosmetic extends BareCosmetic {
    description: string;
    sellCost: number;
    packName: string;
}

// "Color" is the only style currently.
interface STCosmeticStyle {
    categories: {
        name: "Color";
        options: {
            name: string;
            preview: {
                type: "color";
                color: string;
            };
            applications: {
                type: "color";
                slotNames: string[];
                color: string;
            }[];
        }[];
    }[];
}

export interface STCosmetic {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    style?: STCosmeticStyle;
}