<script lang="ts">
    import Commands from "$content/core/commands.svelte";
    import * as Dialog from "$shared/ui/dialog";
    import type { CommandCallback } from "$types/api/commands";
    import Search from "@lucide/svelte/icons/search";
    import { computeCommandScore } from "bits-ui";
    import { watch } from "runed";
    import type { Action } from "svelte/action";

    let selectedIndex = $state(0);
    let searched = $state("");
    let selectSearch = $state("");
    let textInput = $state("");
    let numberInput: number | undefined = $state();
    watch([() => searched, () => selectSearch], () => {
        selectedIndex = 0;
    });

    interface Option {
        text: string;
        score: number;
        callback: CommandCallback;
    }

    // Calculate which options to show in general
    let items = $derived.by(() => {
        let options: Option[] = [];

        for(let command of Commands.commands) {
            if(command.hidden?.()) continue;
            const text = typeof command.text === "function" ? command.text() : command.text;
            const score = computeCommandScore(text, searched, command.keywords as string[]);

            if(score === 0) continue;
            options.push({ text, score, callback: command.callback });
        }

        options.sort((a, b) => b.score - a.score);
        return options;
    });

    interface SelectOption {
        label: string;
        value: string;
        score: number;
    }

    // Calculate which options to show in the select action
    let selectItems = $derived.by(() => {
        if(Commands.action?.type !== "select") return [];

        let options: SelectOption[] = [];
        for(let option of Commands.action.options.options) {
            const score = computeCommandScore(option.label, selectSearch);
            if(score === 0) continue;

            options.push({ label: option.label, value: option.value, score });
        }

        options.sort((a, b) => b.score - a.score);
        return options;
    });

    function inputKeydown(e: KeyboardEvent, max: number) {
        if(!Commands.open) return;

        if(e.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % max;
        } else if(e.key === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + max) % max;
        } else if(e.key === "Enter") {
            onSelect(selectedIndex);
        }
    }

    function onSelect(index: number) {
        if(Commands.action?.type === "select") {
            const option = selectItems[index];
            if(!option) return;

            Commands.action.callback(option.value);
            return;
        } else if(Commands.action?.type === "string") {
            if(!textInput) return;

            Commands.action.callback(textInput);
            return;
        } else if(Commands.action?.type === "number") {
            if(numberInput === undefined) return;

            let oldValue = numberInput;
            const options = Commands.action.options;
            if(options.min !== undefined) numberInput = Math.max(numberInput, options.min);
            if(options.max !== undefined) numberInput = Math.min(numberInput, options.max);
            if(options.decimal === false) numberInput = Math.round(numberInput);
            if(numberInput !== oldValue) return;

            Commands.action.callback(numberInput);
            return;
        }

        const command = items[index];
        if(!command) return;

        Commands.runCommand(command.callback);
    }

    function onOpenChange(open: boolean) {
        if(open) return;

        searched = "";
        selectSearch = "";
        textInput = "";
        numberInput = undefined;
        Commands.onClosed();
    }

    const makeVisible: Action<HTMLElement, boolean> = (node, show) => {
        if(show) node.scrollIntoView({ block: "nearest" });

        return {
            update(show: boolean) {
                if(show) node.scrollIntoView({ block: "nearest" });
            }
        };
    };

    const inputClass = "placeholder:text-muted-foreground outline-hidden flex h-10 w-full rounded-md py-3 text-sm";
</script>

{#snippet item(text: string, index: number)}
    <button
        use:makeVisible={index === selectedIndex}
        data-selected={index === selectedIndex ? true : null}
        onclick={() => onSelect(index)}
        onmouseover={() => selectedIndex = index}
        onfocus={() => selectedIndex = index}
        class="
            data-selected:bg-accent data-selected:text-accent-foreground w-full outline-hidden
            relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1! text-sm!
        ">
        {text}
    </button>
{/snippet}

<Dialog.Root bind:open={Commands.open} onOpenChangeComplete={onOpenChange}>
    <Dialog.Overlay class="z-100" />
    <Dialog.Content
        class="flex flex-col p-0 gap-0 overflow-hidden z-100"
        style="width: min(600px, 90vw)"
        showCloseButton={false}>
        {#if !Commands.action}
            <div class="flex h-9 items-center gap-2 border-b pl-3 pr-8">
                <Search class="size-4 shrink-0 opacity-50" />
                <input
                    placeholder="Type a command or search..."
                    bind:value={searched}
                    spellcheck={false}
                    class={inputClass}
                    onkeydown={(e) => inputKeydown(e, items.length)}
                />
            </div>
            <div class="max-h-80 scroll-py-1 overflow-y-auto overflow-x-hidden p-2">
                {#each items as command, i}
                    {@render item(command.text, i)}
                {/each}
                {#if items.length === 0}
                    <div class="w-full p-2 text-center text-sm text-muted-foreground">
                        No commands found.
                    </div>
                {/if}
            </div>
        {:else if Commands.action.type === "select"}
            <div class="h-9 border-b pl-3 pr-8">
                <input
                    placeholder={Commands.action.options.title}
                    bind:value={selectSearch}
                    spellcheck={false}
                    class={inputClass}
                    onkeydown={(e) => inputKeydown(e, selectItems.length)}
                />
            </div>
            <div class="max-h-80 scroll-py-1 overflow-y-auto overflow-x-hidden p-2">
                {#each selectItems as option, i}
                    {@render item(option.label, i)}
                {/each}
            </div>
        {:else if Commands.action.type === "string"}
            <div class="h-9 pl-3 pr-8">
                <input
                    placeholder={Commands.action.options.title}
                    bind:value={textInput}
                    spellcheck={false}
                    maxlength={Commands.action.options.maxLength}
                    class={inputClass}
                    onkeydown={(e) => inputKeydown(e, 1)}
                />
            </div>
        {:else}
            <div class="h-9 pl-3 pr-8">
                <input
                    placeholder={Commands.action.options.title}
                    type="number"
                    bind:value={numberInput}
                    spellcheck={false}
                    class={inputClass}
                    min={Commands.action.options.min}
                    max={Commands.action.options.max}
                    step={Commands.action.options.decimal ? null : 1}
                    onkeydown={(e) => inputKeydown(e, 1)}
                />
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>
