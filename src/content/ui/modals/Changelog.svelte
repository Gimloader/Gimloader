<script lang="ts">
    import Modals from "$content/core/modals.svelte";
    import * as Dialog from "$shared/ui/dialog";

    function onOpenChangeComplete(open: boolean) {
        if(open) Modals.clearUpdated();
    }
</script>

{#if Modals.updated.length > 0}
    <Dialog.Root open={true} {onOpenChangeComplete}>
        <Dialog.Content class="flex flex-col gap-2 text-gray-600" style="max-width: min(760px, calc(100% - 32px))">
            <Dialog.Header class="text-2xl font-bold! border-b-2">
                New Updates
            </Dialog.Header>
            <div class="overflow-y-auto">
                {#each Modals.updated as update, i}
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
                    {#if i < Modals.updated.length - 1}
                        <hr class="my-4 border-t border-gray-300" />
                    {/if}
                {/each}
            </div>
        </Dialog.Content>
    </Dialog.Root>
{/if}
