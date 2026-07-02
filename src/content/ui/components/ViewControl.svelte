<script lang="ts">
    import ViewModule from "svelte-material-icons/ViewModule.svelte";
    import ViewList from "svelte-material-icons/ViewList.svelte";
    import Storage from "$core/storage.svelte";

    function setView(mode: string) {
        Storage.updateSetting("menuView", mode);
    }
</script>

<button
    class="w-[30px] h-7 flex items-center justify-center rounded-md ml-1"
    class:bg-gray-200={Storage.settings.menuView == "grid"}
    onclick={() => setView("grid")}
>
    <ViewModule width={24} height={24} />
</button>
<button
    class="w-[30px] h-7 flex items-center justify-center rounded-md ml-1"
    class:bg-gray-200={Storage.settings.menuView == "list"}
    onclick={() => setView("list")}
>
    <ViewList width={24} height={24} />
</button>
