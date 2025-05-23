<script lang="ts">
    import type Plugin from "$core/scripts/plugin.svelte";
    import LibManager from "$core/scripts/libManager.svelte";
    import { checkLibUpdate } from "$core/net/checkUpdates";
    import Net from "$core/net/net";
    import showErrorMessage from "../showErrorMessage";
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from "flowbite-svelte";

    import OpenInNew from "svelte-material-icons/OpenInNew.svelte";
    import Update from "svelte-material-icons/Update.svelte";
    import Download from "svelte-material-icons/Download.svelte";

    interface Props {
        plugin: Plugin;
    }

    let { plugin }: Props = $props();
    
    interface ILibInfo {
        name: string;
        url?: string;
        required: boolean;
    }

    let libsInitial: ILibInfo[] = [];

    for(let lib of plugin.headers.needsLib) {
        let parts = lib.split('|').map((p: string) => p.trim());
        libsInitial.push({ name: parts[0], url: parts[1], required: true });
    }

    for(let lib of plugin.headers.optionalLib) {
        let parts = lib.split('|').map((p: string) => p.trim());
        libsInitial.push({ name: parts[0], url: parts[1], required: false });
    }

    let libsInfo: ILibInfo[] = $state(libsInitial);

    function downloadLib(name: string, url: string) {
        Net.downloadLibrary(url)
            .then(() => libsInfo = libsInfo)
            .catch((err) => showErrorMessage(err, `Failed to download library ${name}`));
    }
</script>

<Table>
    <TableHead>
        <TableHeadCell>Installed?</TableHeadCell>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>URL</TableHeadCell>
        <TableHeadCell>Required?</TableHeadCell>
        <TableHeadCell></TableHeadCell>
    </TableHead>
    <TableBody>
        {#each libsInfo as libInfo}
            {@const lib = LibManager.getLib(libInfo.name)}
            <TableBodyRow>
                <TableBodyCell>{lib ? 'Yes' : 'No'}</TableBodyCell>
                <TableBodyCell>{libInfo.name}</TableBodyCell>
                <TableBodyCell class="max-w-80 text-wrap">
                    {#if libInfo.url}
                        <a class="hover:underline" href={libInfo.url} target="_blank" rel="noopener noreferrer">
                            {libInfo.url}
                            <OpenInNew class="inline-block" size={16} />
                        </a>
                    {:else}
                        None
                    {/if}
                </TableBodyCell>
                <TableBodyCell>{libInfo.required ? 'Yes' : 'No'}</TableBodyCell>
                <TableBodyCell>
                    {#if lib && lib.headers.downloadUrl}
                        <button onclick={() => checkLibUpdate(lib)}>
                            <Update size={25} />
                        </button>
                    {:else if libInfo.url}
                        <button onclick={() => downloadLib(libInfo.name, libInfo.url)}>
                            <Download size={25} />
                        </button>
                    {/if}
                </TableBodyCell>
            </TableBodyRow>
        {/each}
    </TableBody>
</Table>