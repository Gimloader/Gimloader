<script lang="ts">
    import LibManager from "$core/scripts/libManager.svelte";
    import { checkUpdate } from "$core/net/checkUpdates";
    import * as Table from "$shared/ui/table";
    import * as Dialog from "$shared/ui/dialog";

    import OpenInNew from "svelte-material-icons/OpenInNew.svelte";
    import Update from "svelte-material-icons/Update.svelte";
    import Download from "svelte-material-icons/Download.svelte";
    import { downloadScript } from "$core/net/download";
    import { parseDep } from "$shared/parseHeader";

    interface Props {
        name: string;
        needsLib: string[];
        optionalLib: string[];
        onClose: () => void;
    }

    let { name, needsLib, optionalLib, onClose }: Props = $props();

    interface ILibInfo {
        name: string;
        url?: string;
        required: boolean;
    }

    let libsInitial: ILibInfo[] = [];

    for(let lib of needsLib) {
        let [name, url] = parseDep(lib);
        libsInitial.push({ name, url, required: true });
    }

    for(let lib of optionalLib) {
        let [name, url] = parseDep(lib);
        libsInitial.push({ name, url, required: false });
    }

    let libsInfo: ILibInfo[] = $state(libsInitial);
</script>

<Dialog.Root open={true} onOpenChangeComplete={onClose}>
    <Dialog.Content class="text-gray-600 block" style="max-width: min(760px, calc(100% - 32px))">
        <Dialog.Header class="border-b w-full text-xl font-bold! mb-4">
            Libraries used by {name}
        </Dialog.Header>
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head>Installed?</Table.Head>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>URL</Table.Head>
                    <Table.Head>Required</Table.Head>
                    <Table.Head></Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each libsInfo as libInfo}
                    {@const lib = LibManager.getScript(libInfo.name)}
                    <Table.Row>
                        <Table.Cell>
                            {lib ? "Yes" : "No"}
                        </Table.Cell>
                        <Table.Cell>
                            {libInfo.name}
                        </Table.Cell>
                        <Table.Cell>
                            {#if libInfo.url}
                                <a
                                    class="hover:underline block max-w-80 text-wrap"
                                    href={libInfo.url}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    {libInfo.url}
                                    <OpenInNew class="inline-block" size={16} />
                                </a>
                            {:else}
                                None
                            {/if}
                        </Table.Cell>
                        <Table.Cell>
                            {libInfo.required ? "Yes" : "No"}
                        </Table.Cell>
                        <Table.Cell>
                            {#if lib && lib.headers.downloadUrl}
                                <button onclick={() => checkUpdate(lib)}>
                                    <Update size={25} />
                                </button>
                            {:else if libInfo.url}
                                <button onclick={() => downloadScript(libInfo.url, "library")}>
                                    <Download size={25} />
                                </button>
                            {/if}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </Dialog.Content>
</Dialog.Root>
