<script lang="ts" module>
    interface Update {
        name: string;
        version: string;
        changes: string[];
    }

    let open = $state(false);
    let updates: Update[] = $state([]);

    export function addUpdated(name: string, version: string, changes: string[]) {
        updates.push({ name, version, changes });
        open = true;
    }
</script>

<script lang="ts">
    import * as Dialog from "$shared/ui/dialog";

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
