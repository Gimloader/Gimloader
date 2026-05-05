import type { CodeInfoFailure, CodeInfoSuccess, Experience, Hook, LiveGameOptions, MapCreationOptions, MatchmakerOptions, PublicGame } from './matchmaker';
import type { OpenedCosmetic, OwnedCosmetic, Pack, PackCosmetic, PackCosmeticItem, Shop, STCosmetic } from './cosmos';
import type { Creator, Folder, Game, QuestionAdded, QuestionEdit } from './kits';
import type { FullGroup, HubItem } from './groups';
import type { CreatedMap, PublicMap, PublicMapSection } from './maps';
import type { InformationUpdate, UserData } from './users';

interface NewsPost {
    _id: string;
    publishDate: number;
    notionPageId: string;
}

export interface EndpointRequests {
    "/api/games/gallery": undefined;
    "/api/games/summary/me": undefined;
    "/api/games/search": {
        language?: string;
        query: string;
        sort: "relevant" | "recent";
        page: number;
        subject?: string;
    };
    "/api/games/archived": {
        archived: boolean;
        id: string;
    }
    "/api/folders/new": {
        title: string;
    };
    "/api/folders/addGame": {
        folderId: string;
        gameId: string;
    };
    "/pages/general": undefined;
    [key: `/api/hub/hub-items${string}`]: undefined;
    "/api/v1/groups": undefined;
    [key: `/api/games/fetch/${string}`]: undefined;
    "/api/experiences": undefined;
    "/api/experience/map/hooks": undefined;
    "/api/matchmaker/find-info-from-code": {
        code: string;
    };
    [key: `/api/matchmaker/intent/fetch-source/${string}`]: undefined;
    [key: `/api/matchmaker/intent/map/summary/${string}`]: undefined;
    "/api/matchmaker/instant-join": undefined;
    "/api/v1/editor/questions/add": {
        questions: QuestionEdit[];
    };
    "/api/created-maps": undefined;
    "/api/created-map/basics": undefined;
    "/api/created-map/create": {
        mapStyle: "topDown" | "platformer"
    };
    "/api/created-map/rename": {
        id: string;
        name: string;
    };
    "/api/created-map/delete": {
        id: string;
    }
    "/api/cosmos/shop": undefined;
    "/api/cosmos/basics": undefined;
    "/api/cosmos/owned-cosmetics": undefined;
    [key: `/api/cosmos/pack/details/${string}`]: undefined;
    "/api/cosmos/pack/open": {
        count: number;
        pack: string;
    };
    "/api/cosmos/season-ticket": undefined;
    "/api/cosmos/select-cosmetic": {
        cosmeticId: string;
        cosmeticType: string;
    };



    "/api/news/fetch": {
        isStudent: boolean;
    };
    "/api/matchmaker/intent/map/play/create": {
        experienceId: string;
        matchmakerOptions: MatchmakerOptions;
        options: MapCreationOptions;
    };
    "/api/matchmaker/intent/live-game/create": {
        experienceId: string;
        gameId: string;
        gameOptions: LiveGameOptions;
        matchmakerOptions: MatchmakerOptions;
    };
    "/api/matchmaker/join": {
        clientType: string;
        name: string;
        roomId: string;
    };
    "/api/games/delete": {
        id: string;
    };
    "/api/created-map/listing/discovery/search": {
        query: string;
    }
    "/api/cosmos/owned-stickers": undefined;
    "/api/created-map/listing/discovery": undefined;
    "/api/v1/givekit/apply": {
        comments: string;
        dateNeeded: string;
        email: string;
        firstName: string;
        lastName: string;
        permission: boolean;
        projectLink: string;
        role: string;
    };
    [key: `/api/content/${string}`]: undefined;
    "/api/users/update-information": {
        changes: InformationUpdate[];
    };
    "/api/v1/groups/part-of": undefined;
    "/api/v1/editor/edit-session": {
        kitId: string;
    };
}

export interface EndpointResponses {
    "/api/games/gallery": PublicGame[];
    "/api/games/summary/me": {
        games: Game[];
        folders: Folder[];
    };
    "/api/games/search": {
        results: PublicGame[];
        hasMore: boolean;
        page: number;
    };
    "/api/games/archived": "OK";

    "/api/folders/new": string;
    "/api/folders/addGame": "OK";
    "/pages/general": {
        userData: UserData;
    };
    [key: `/api/hub/hub-items${string}`]: HubItem[];
    "/api/v1/groups": any[];
    "/api/v1/groups/part-of": FullGroup[];
    "/api/news/fetch": NewsPost[];
    [key: `/api/games/fetch/${string}`]: {
        kit: Game;
        creator: Creator;
    };
    "/api/experiences": Experience[];
    "/api/experience/map/hooks": {
        hooks: Hook[];
    };
    "/api/matchmaker/find-info-from-code": CodeInfoSuccess | CodeInfoFailure;
    [key: `/api/matchmaker/intent/fetch-source/${string}`]: string;
    [key: `/api/matchmaker/intent/map/summary/${string}`]: {
        mapId: string;
    };
    "/api/matchmaker/intent/map/play/create": string;
    "/api/matchmaker/intent/live-game/create": string;
    "/api/games/delete": "OK";
    "/api/matchmaker/join": {
        source: string;
        serverUrl: string;
        roomId: string;
        intentId: string;
    }
    "/api/matchmaker/instant-join": any;
    "/api/v1/editor/questions/add": QuestionAdded[];
    "/api/created-maps": CreatedMap[];
    "/api/created-map/basics": {
        mapLimit: number;
        completedTutorial: null | boolean;
    };
    "/api/created-map/create": string;
    "/api/created-map/rename": string;
    "/api/created-map/delete": string;
    "/api/created-map/listing/discovery/search": PublicMap[];
    "/api/cosmos/shop": {
        shop: Shop;
        packs: Pack[];
    };
    "/api/cosmos/basics": {
        currentLevel: number;
        unredeemedXP: number;
        xpGainedInPeriod: number;
        xpGainedToday: number;
        maxXpInPeriod: number;
        maxXpToday: number;
        currencyGainedPerLevel: number;
        xpNeededPerLevel: number;
        currency: number;
        selectedCharacter: string | null;
    }
    "/api/cosmos/owned-cosmetics": {
        ownedCosmetics: OwnedCosmetic[];
        selected: {
            character: string | null;
            trail: string | null;
        };
    };
    [key: `/api/cosmos/pack/details/${string}`]: {
        name: string;
        cosmetics: PackCosmetic[];
        items: PackCosmeticItem[];
        currencyCost: number;
    };
    "/api/cosmos/pack/open": OpenedCosmetic[];
    "/api/cosmos/season-ticket": STCosmetic[];
    "/api/cosmos/select-cosmetic": "OK";
    "/api/cosmos/owned-stickers": { id: string, name: string }[];
    "/api/created-map/listing/discovery": PublicMapSection[];
    "/api/v1/givekit/apply": "OK";
    // This seems to be some complex type of something called "crdt"
    [key: `/api/content/${string}`]: Record<string, any>;
    "/api/users/update-information": "OK";
    "/api/v1/editor/edit-session": "OK";

}