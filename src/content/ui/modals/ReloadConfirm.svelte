<script lang="ts">
    import * as AlertDialog from "$shared/ui/alert-dialog";
    import Modals from "$core/modals.svelte";
    import { englishList } from "$shared/utils";

    function ignore() {
        Modals.reloadNeeded.clear();
    }
</script>

{#if Modals.reloadNeeded.size > 0}
    <AlertDialog.Root open={true}>
        <AlertDialog.Content class="z-101">
            {englishList(Modals.reloadNames)}
            {Modals.reloadNames.length === 1 ? " requires" : " require"}
            a reload in order to function properly.
            <AlertDialog.Footer class="border-t pt-2">
                <AlertDialog.Cancel onclick={ignore}>Ignore</AlertDialog.Cancel>
                <AlertDialog.Action onclick={() => location.reload()}>Reload Now</AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>
{/if}
