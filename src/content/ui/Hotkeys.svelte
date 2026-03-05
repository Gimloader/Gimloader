<script lang="ts">
    import type ConfigurableHotkey from "$core/hotkeys/configurable.svelte";
    import type { HotkeyTrigger } from "$types/api/hotkeys";
    import { Button } from "$shared/ui/button";
    import * as Popover from "$shared/ui/popover";
    import Undo from "svelte-material-icons/Undo.svelte";
    import { SvelteSet } from "svelte/reactivity";
    import Hotkeys from "$core/hotkeys/hotkeys.svelte";

    let hotkeys = Hotkeys.configurableHotkeys;

    let categories: Record<string, ConfigurableHotkey[]> = $derived.by(() => {
        let categories = {};
        for(let hotkey of hotkeys.values()) {
            if(!categories[hotkey.category]) {
                categories[hotkey.category] = [];
            }
            categories[hotkey.category].push(hotkey);
        }
        return categories;
    });

    let configuring: ConfigurableHotkey | null = $state(null);

    function onKeydown(e: KeyboardEvent) {
        if(!configuring || !e.key) return;
        e.preventDefault();
        e.stopPropagation();

        if(e.key === "Enter") {
            stopConfigure();
        } else {
            configuring.trigger = {
                key: e.code,
                ctrl: e.ctrlKey,
                alt: e.altKey,
                shift: e.shiftKey
            };
        }
    }

    function onEscape() {
        configuring.trigger = null;
        stopConfigure();
    }

    function stopConfigure() {
        if(!configuring) return;

        Hotkeys.saveConfigurable(configuring.id, configuring.trigger);
        configuring = null;
    }

    function renameKey(key: string) {
        if(key === " ") return "Space";
        return key[0].toUpperCase() + key.slice(1);
    }

    function onOpenChange(open: boolean, hotkey: ConfigurableHotkey) {
        if(open) configuring = hotkey;
        else stopConfigure();
    }

    function reset(hotkey: ConfigurableHotkey, noSave = false) {
        hotkey.reset();

        if(noSave) return;
        Hotkeys.saveConfigurable(hotkey.id, hotkey.trigger);
    }

    function resetAll() {
        if(!confirm("Are you sure you want to reset all hotkeys?")) return;
        for(let hotkey of hotkeys.values()) {
            reset(hotkey, true);
        }

        Hotkeys.saveAllConfigurable();
    }

    function formatTrigger(trigger: HotkeyTrigger | null) {
        if(!trigger) return "Not Bound";

        let keys: string[] = [];
        if(trigger.key) {
            if(trigger.ctrl && !trigger.key.startsWith("Control")) keys.push("Ctrl");
            if(trigger.alt && !trigger.key.startsWith("Alt")) keys.push("Alt");
            if(trigger.shift && !trigger.key.startsWith("Shift")) keys.push("Shift");

            if(trigger.key.startsWith("Key")) keys.push(trigger.key.slice(3));
            else if(trigger.key.startsWith("Digit")) keys.push(trigger.key.slice(5));
            else keys.push(trigger.key);
        } else {
            if(trigger.ctrl && !trigger.keys.some(key => key.startsWith("Control"))) keys.push("Ctrl");
            if(trigger.alt && !trigger.keys.some(key => key.startsWith("Alt"))) keys.push("Alt");
            if(trigger.shift && !trigger.keys.some(key => key.startsWith("Shift"))) keys.push("Shift");

            for(let key of trigger.keys) {
                if(key.startsWith("Key")) keys.push(key.slice(3));
                else if(key.startsWith("Digit")) keys.push(key.slice(5));
                else keys.push(key);
            }
        }

        return keys.join(" + ");
    }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="flex flex-col max-h-full gap-2">
    <div class="grow overflow-y-auto grid gap-x-5 gap-y-1 pb-1" style="grid-template-columns: auto auto auto 1fr">
        {#if Object.keys(categories).length === 0}
            <h1 class="col-span-4 text-center font-bold text-3xl pt-5">There aren't any hotkeys!</h1>
            <h2 class="col-span-4 text-center text-xl">Some plugins will add hotkeys that can be changed here.</h2>
        {/if}
        {#each Object.entries(categories) as [category, hotkeys], i}
            <h2 class="text-xl font-bold! col-span-4 border-b border-gray-200">{category}</h2>
            {#each hotkeys as hotkey}
                <div class="flex items-center">
                    {hotkey.title}
                </div>
                <Popover.Root bind:open={() => configuring === hotkey, (open) => onOpenChange(open, hotkey)}>
                    <Popover.Trigger class="w-full">
                        <Button class="w-full">
                            {#if hotkey.trigger === null}
                                Not Bound
                            {:else if hotkey.trigger instanceof SvelteSet}
                                {#if hotkey.trigger.size === 0}
                                    Not Bound
                                {:else}
                                    {Array.from(hotkey.trigger).map(renameKey).join(" + ")}
                                {/if}
                            {:else}
                                {formatTrigger(hotkey.trigger)}
                            {/if}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content class="p-0" onEscapeKeydown={onEscape}>
                        <div class="bg-accent w-full border-b font-bold! px-4 py-2">
                            Configure hotkey
                        </div>
                        <div class="p-3">
                            Click outside or hit enter to confirm
                        </div>
                    </Popover.Content>
                </Popover.Root>
                <button onclick={() => reset(hotkey)}>
                    <Undo />
                </button>
                <div></div>
            {/each}
        {/each}
    </div>
    <div>
        {#if Object.keys(categories).length > 0}
            <Button class="h-7" onclick={resetAll}>
                <Undo class="mr-1" />Reset All
            </Button>
        {/if}
    </div>
</div>
