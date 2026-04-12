import type { HexColor } from "./theme";

interface ShopItem {
    background: HexColor;
    cost: number;
    description: string;
    icon: string;
    id: string;
    name: string;
}

type Role = "imposter" | "detective";

interface ImposterMe {
    blendingIn: boolean;
    canNeverBeClear: boolean;
    currentVote: string;
    id: string;
    markedAsClear: boolean;
    name: string;
    notes: string;
    role: Role;
    votedOff: boolean;
}

interface MeetingResult {
    name: string;
    wasImposter: boolean;
}

interface Person {
    canNeverBeClear: boolean;
    id: string;
    markedAsClear: boolean;
    name: string;
    role: Role;
    votedOff: boolean;
}

type Status = "intro" | "questions" | "discussion" | "voting" | "votingResult";

interface BaseImposter {
    impostersLeft: number;
    investigationsLeft: number;
    meetingsLeft: number;
    status: Status;
}

export interface HostImposter extends BaseImposter {
    meetingResults: MeetingResult | null;
    people: Person[];
    votes: number;
}

export interface GuestImposter extends BaseImposter {
    currentShopItem: string | null;
    currentShopItemModalVisible: boolean;
    epl: string | null;
    me: ImposterMe | null;
    noteDrawerOpen: boolean;
    roleModalOpen: boolean;
    shopItems: ShopItem[];
}
