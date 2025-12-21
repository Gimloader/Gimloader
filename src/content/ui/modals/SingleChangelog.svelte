<script lang="ts">
    import * as Dialog from "$shared/ui/dialog";

    interface Props {
        name: string;
        version: string;
        changes: string[];
    }
    const { name, version, changes }: Props = $props();
</script>

<Dialog.Root open={true}>
    <Dialog.Content class="flex flex-col gap-2 text-gray-600" style="max-width: min(760px, calc(100% - 32px))">
        <Dialog.Header class="text-2xl font-bold! border-b-2">
            {name} v{version} Changes
        </Dialog.Header>
        <ul class="list-disc pl-6 mb-0!">
            {#each changes as change}
                <li>{change}</li>
            {/each}
        </ul>
    </Dialog.Content>
</Dialog.Root>
