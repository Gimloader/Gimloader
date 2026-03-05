<script lang="ts">
    import Port from "$shared/net/port.svelte";
    import ContentSaveAlertOutline from "svelte-material-icons/ContentSaveAlertOutline.svelte";
    import ContentSaveOutline from "svelte-material-icons/ContentSaveOutline.svelte";
    import Close from "svelte-material-icons/Close.svelte";
    import { defaultLibraryScript, defaultPluginScript } from "./consts";
    import State from "$shared/net/bareState.svelte";
    import { parseScriptHeaders } from "$shared/parseHeader";
    import type { CreateEditor, Editor } from "$types/editor";
    import type { ScriptType } from "$types/net/messages";

    let { createEditor }: { createEditor: CreateEditor } = $props();

    const params = new URLSearchParams(location.search);
    const type = params.get("type") as ScriptType;
    let name: string | undefined = $state(params.get("name"));

    let existing = $derived.by(() => {
        if(type === "plugin") return State.plugins.find(p => p.name === name);
        else return State.libraries.find(l => l.name === name);
    });

    let title = $derived(`${existing ? "Editing" : "Creating"} ${name ? `${type} ${name}` : `a new ${type}`}`);
    $effect(() => {
        document.title = `${title} | Gimloader`;
    });

    let editorDiv: HTMLElement = $state();
    let saved = $state(true);
    let editor: Editor;

    State.init(() => {
        let value: string;

        if(existing) value = existing.code;
        else if(type === "plugin") value = defaultPluginScript;
        else value = defaultLibraryScript;

        editor = createEditor({
            element: editorDiv,
            code: value,
            onChange: () => saved = false
        });
    });

    function save() {
        let code = editor.getValue();
        let headers = parseScriptHeaders(code);
        const isLibrary = headers.isLibrary !== "false";

        if(type === "plugin") {
            if(isLibrary) {
                alert("Plugins must not have the @isLibrary header");
                return;
            }
        } else {
            if(!isLibrary) {
                alert("Libraries must have the @isLibrary header");
                return;
            }
        }

        Port.sendAndRecieve("editOrCreate", { name, code });

        name = headers.name;
        saved = true;
    }

    function beforeUnload(e: BeforeUnloadEvent) {
        if(!saved) e.preventDefault();
    }

    function close() {
        if(!saved && !confirm("You have unsaved changes! Are you sure you want to exit?")) return;
        saved = true;

        chrome.tabs.getCurrent().then((tab) => chrome.tabs.remove(tab.id));
    }

    function onKeydown(e: KeyboardEvent) {
        if(e.code === "KeyS" && e.ctrlKey) {
            e.preventDefault();
            save();
        }
    }
</script>

<svelte:window on:beforeunload={beforeUnload} onkeydown={onKeydown} />

<div class="w-screen h-screen bg">
    {#if type !== "plugin" && type !== "library"}
        <h1 class="w-full text-center text-8xl text-white m-0">Invalid URL</h1>
    {:else}
        <div class="h-10 border-0 border-solid border-b border-white text-white text-2xl flex gap-2 items-center px-2">
            <div>
                {title}
            </div>
            <div class="grow"></div>
            <button class="bg-white text-lg text-gray-700 rounded-full flex items-center gap-2 px-2" onclick={save}>
                {#if saved}
                    <ContentSaveOutline size={24} />
                {:else}
                    <ContentSaveAlertOutline size={24} />
                {/if}
                Save
            </button>
            <button class="bg-white text-lg text-gray-700 rounded-full flex items-center gap-2 px-2" onclick={close}>
                <Close size={24} />
                Exit
            </button>
        </div>
        <div style="height: calc(100vh - 41px)" class="w-full grid overflow-auto" bind:this={editorDiv}></div>
    {/if}
</div>

<style>
    .bg {
        font-family: Consolas, "Courier New", monospace;
        background-color: #1e1e1e;
    }
</style>
