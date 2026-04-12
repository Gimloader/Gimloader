import type { Theme } from "./theme";

interface TeamMeta {
    isBoss?: boolean;
}

interface Team {
    color: Theme;
    icon?: string;
    id: string;
    meta: TeamMeta;
}

export default interface User {
    groupId: string;
    groupMemberId: string;
    name: string;
    place: number;
    readToMeEnabled: boolean;
    team: Team | null;
    theme: string;
}
