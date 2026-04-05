<script lang="ts" module>
    import { SvelteSet } from "svelte/reactivity";

    let reloadNeeded = new SvelteSet<string>();
    let names = $derived(Array.from(reloadNeeded));

    export function addReloadNeeded(name: string) {
        reloadNeeded.add(name);
    }
</script>

<script lang="ts">
    import * as AlertDialog from "$shared/ui/alert-dialog";
    import { englishList } from "$shared/utils";

    function ignore() {
        reloadNeeded.clear();
    }
</script>

<AlertDialog.Root open={names.length > 0}>
    <AlertDialog.Content class="z-101">
        {englishList(names)}
        {names.length === 1 ? " requires" : " require"}
        a reload in order to function properly.
        <AlertDialog.Footer class="border-t pt-2">
            <AlertDialog.Cancel onclick={ignore}>Ignore</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => location.reload()}>Reload Now</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
