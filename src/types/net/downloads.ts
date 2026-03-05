import type { ScriptType } from "./messages";

export interface Dependency {
    name: string;
    type: ScriptType;
    url?: string;
}

export interface Update {
    name: string;
    code: string;
    dependencies: Dependency[];
}

export interface UpdateResponse {
    updated: boolean;
    failed?: boolean;
    version?: string;
}
