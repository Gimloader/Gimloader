<script lang="ts" module>
    interface Update {
        name: string;
        version: string;
        changes: string[];
    }

    let open = $state(false);
    let updates: Update[] = $state([]);

    const versionRegex = /^\s*\[(\d+(?:\.\d+)*)\]\s*/;
    function checkChangeVersion(change: string, oldVersion: string | null) {
        if(!oldVersion) return true;

        const version = change.match(versionRegex);
        if(!version) return true;

        return isVersionGreater(oldVersion, version[1]);
    }

    export function addUpdated(name: string, version: string, oldVersion: string | null, changes: string[]) {
        const showChanges = changes.filter((change) => checkChangeVersion(change, oldVersion))
            .map((change) => change.replace(versionRegex, ""));

        updates.push({ name, version, changes: showChanges });
        open = true;
    }
</script>

<script lang="ts">
    import * as Dialog from "$shared/ui/dialog";
    import { isVersionGreater } from "$shared/utils";

    function onOpenChangeComplete(isOpen: boolean) {
        if(!isOpen) updates = [];
    }
</script>

<Dialog.Root bind:open {onOpenChangeComplete}>
    <Dialog.Content class="flex flex-col gap-2 text-gray-600" style="max-width: min(760px, calc(100% - 32px))">
        <Dialog.Header class="text-2xl font-bold! border-b-2">
            New Updates
        </Dialog.Header>
        <div class="overflow-y-auto">
            {#each updates as update, i}
                <div class="text-xl font-semibold!">
                    {update.name} v{update.version}
                </div>
                <ul class="list-disc pl-6 mb-0!">
                    {#each update.changes as change}
                        <li>
                            {change}
                        </li>
                    {/each}
                </ul>
                {#if i < updates.length - 1}
                    <hr class="my-4 border-t border-gray-300" />
                {/if}
            {/each}
        </div>
    </Dialog.Content>
</Dialog.Root>
