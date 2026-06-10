import { Tooltip as TooltipPrimitive, type TooltipRootProps } from "bits-ui";
import Trigger from "./tooltip-trigger.svelte";
import Content from "./tooltip-content.svelte";
import type { Component } from "svelte";

// biome-ignore lint: typescript explodes when it tries to figure out the type of Root for some reason
type RootType = Component<TooltipRootProps, {}, "open" | "triggerId">;

const Root = TooltipPrimitive.Root as RootType;
const Provider = TooltipPrimitive.Provider;
const Portal = TooltipPrimitive.Portal;

export {
    Content,
    Content as TooltipContent,
    Portal,
    Portal as TooltipPortal,
    Provider,
    Provider as TooltipProvider,
    Root,
    //
    Root as Tooltip,
    Trigger,
    Trigger as TooltipTrigger
};
