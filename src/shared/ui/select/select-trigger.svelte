<script lang="ts">
    import { Select as SelectPrimitive } from "bits-ui";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import { cn, type WithoutChild } from "$shared/shadcn.js";

    let {
        ref = $bindable(null),
        class: className,
        children,
        size = "default",
        ...restProps
    }: WithoutChild<SelectPrimitive.TriggerProps> & {
        size?: "sm" | "default";
    } = $props();
</script>

<SelectPrimitive.Trigger
    bind:ref
    data-slot="select-trigger"
    data-size={size}
    class={cn(
        "bg-primary text-white! data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive shadow-xs flex w-fit select-none items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
>
    {@render children?.()}
    <ChevronDownIcon class="size-4 opacity-70" color="white" />
</SelectPrimitive.Trigger>
