export interface CreatedMap {
    _id: string;
    name: string;
}

export interface PublicMap {
    _id: string;
    title: string;
    image: string;
    tags: string[];
}

export interface PublicMapSection {
    name: string;
    description: string;
    items: PublicMap[];
}