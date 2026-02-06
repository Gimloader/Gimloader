<script lang="ts">
    import { Switch as SwitchPrimitive } from "bits-ui";
    import { cn, type WithoutChildrenOrChild } from "$shared/shadcn.js";
    import type { Snippet } from "svelte";

    interface Props extends WithoutChildrenOrChild<SwitchPrimitive.RootProps> {
        children?: Snippet;
    }

    let {
        ref = $bindable(null),
        class: className,
        checked = $bindable(false),
        children,
        ...restProps
    }: Props = $props();
</script>

<SwitchPrimitive.Root
    bind:ref
    bind:checked
    data-slot="switch"
    class={cn(
        "w-11 h-[22px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 shadow-xs peer inline-flex shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
    )}
    {...restProps}>
    <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        class={cn(
            "bg-background pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%+2px)] data-[state=unchecked]:translate-x-0"
        )}>{@render children?.()}</SwitchPrimitive.Thumb>
</SwitchPrimitive.Root>
