<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$shared/shadcn.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
    bind:ref
    data-slot="tabs-trigger"
    class={cn(
        "hover:bg-gray-50 data-[state=active]:text-primary-600! data-[state=active]:bg-gray-100 p-4 text-muted-foreground inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-t-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
    )}
    {...restProps}
/>
