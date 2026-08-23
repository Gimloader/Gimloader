import type { StateMessageProps, StateMessages } from "$types/net/messages";
import type { State } from "$types/net/state";
import { TypedEventEmitter } from "$shared/utils";

type StateMessageEvents = {
    [Type in StateMessages["type"]]: [
        message: StateMessageProps<Type>,
        remote: boolean,
        cancel: () => void
    ];
};

export const stateMessageEvents = new TypedEventEmitter<StateMessageEvents>();
const broadcastFilters: Record<string, (message: any) => boolean> = {};

export interface StateEvents {
    init: [state: State];
    broadcast: [type: any, props: any];
    error: [message: string];
}

export const stateEvents = new TypedEventEmitter<StateEvents>();

export function handle(type: string, props: any, remote = false) {
    let cancelled = false;
    stateMessageEvents.emit(type, props, remote, () => cancelled = true);
    return cancelled;
}

export function apply<Type extends StateMessages["type"]>(type: Type, message: StateMessageProps<Type>) {
    handle(type, message);
    broadcast(type, message);
}

export function broadcast<Type extends StateMessages["type"]>(type: Type, message: StateMessageProps<Type>) {
    if(broadcastFilters[type]?.(message)) return;
    stateEvents.emit("broadcast", type, message);
}

export function filterBroadcast<Type extends StateMessages["type"]>(type: Type, filter: (message: StateMessageProps<Type>) => boolean) {
    broadcastFilters[type] = filter;
}
