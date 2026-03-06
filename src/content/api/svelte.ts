import * as Index from "svelte";
import * as Client from "svelte/internal/client";

import * as Animate from "svelte/animate";
import * as Attachments from "svelte/attachments";
import * as Easing from "svelte/easing";
import * as Events from "svelte/events";
import * as Motion from "svelte/motion";
import * as WindowReactivity from "svelte/reactivity/window";
import * as Reactivity from "svelte/reactivity";
import * as Store from "svelte/store";
import * as Transition from "svelte/transition";

export interface SvelteExport {
    Index: any;
    Client: any;
    Animate: any;
    Attachments: any;
    Easing: any;
    Events: any;
    Motion: any;
    WindowReactivity: any;
    Reactivity: any;
    Store: any;
    Transition: any;
}

const Svelte: SvelteExport = {
    Index,
    Client,
    Animate,
    Attachments,
    Easing,
    Events,
    Motion,
    WindowReactivity,
    Reactivity,
    Store,
    Transition
};

export default Svelte;
